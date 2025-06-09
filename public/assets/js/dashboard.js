const token = localStorage.getItem('token');
fetch('/api/protected-route', {
  headers: { Authorization: `Bearer ${token}` }
});

if (!localStorage.getItem('token')) {
  window.location.href = '/login.html';
}

document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    { id: "services", requiredFields: 2 },
    { id: "trainers", requiredFields: 3 },
    { id: "testimonials", requiredFields: 2 },
    { id: "lastnews", requiredFields: 2 },
    { id: "subscriptions", requiredFields: 2 },
  ];

  sections.forEach(({ id, requiredFields }) =>
    setupSection(id, requiredFields)
  );
});

function setupSection(sectionId, requiredCount) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const form = section.querySelector("form");
  const tableBody = section.querySelector("table tbody");
  if (!form || !tableBody) return;

  const storageKey = `spider_${sectionId}_data`;

  const savedData = JSON.parse(localStorage.getItem(storageKey)) || [];
  savedData.forEach((dataRow) =>
    addRow(tableBody, dataRow, sectionId, storageKey)
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = Array.from(form.querySelectorAll("input, textarea"));
    const values = inputs.map((input) => input.value.trim());

    if (values.slice(0, requiredCount - 1).some((val) => val === "")) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    // حالة قسم المدربين مع رفع صورة
    if (sectionId === "trainers") {
      const imageInput = form.querySelector('input[type="file"]');
      const file = imageInput.files[0];
      if (!file) {
        alert("يرجى اختيار صورة المدرب.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
          "https://3151de04-72ef-4cfe-a32e-1b7d24b3f829-00-x6mg4vwn74xx.picard.replit.dev/api/trainers/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "فشل رفع الصورة");

        const imageUrl = data.imageUrl;
        values[2] = imageUrl;
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء رفع الصورة.");
        return;
      }
    }

    // الحفظ والعرض
    const newData = [...savedData, values];
    localStorage.setItem(storageKey, JSON.stringify(newData));
    addRow(tableBody, values, sectionId, storageKey);
    inputs.forEach((input) => (input.value = ""));
  });
}

function addRow(tbody, values, sectionId, storageKey) {
  const row = document.createElement("tr");
  const index = tbody.children.length + 1;

  const numCell = document.createElement("td");
  numCell.textContent = index;
  row.appendChild(numCell);

  if (sectionId === "trainers") {
    row.appendChild(createCell(values[0])); // الاسم
    row.appendChild(createCell(values[1])); // التخصص
    const imgCell = document.createElement("td");
    const img = document.createElement("img");
    img.src = values[2];
    img.alt = `صورة ${values[0]}`;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    imgCell.appendChild(img);
    row.appendChild(imgCell);
  } else {
    values.forEach((value) => row.appendChild(createCell(value)));
  }

  const actionCell = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.textContent = "حذف";
  delBtn.classList.add("delete-btn");

  delBtn.addEventListener("click", () => {
    row.remove();
    updateLocalStorage(tbody, sectionId, storageKey);
    renumberRows(tbody);
  });

  actionCell.appendChild(delBtn);
  row.appendChild(actionCell);

  tbody.appendChild(row);
}

function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function updateLocalStorage(tbody, sectionId, storageKey) {
  const data = [];

  Array.from(tbody.children).forEach((row) => {
    const cells = row.querySelectorAll("td");

    if (sectionId === "trainers") {
      data.push([
        cells[1].textContent,
        cells[2].textContent,
        cells[3].querySelector("img")?.src || "",
      ]);
    } else {
      const rowData = [];
      for (let i = 1; i < cells.length - 1; i++) {
        rowData.push(cells[i].textContent);
      }
      data.push(rowData);
    }
  });

  localStorage.setItem(storageKey, JSON.stringify(data));
}

function renumberRows(tbody) {
  Array.from(tbody.children).forEach((row, idx) => {
    row.querySelector("td").textContent = idx + 1;
  });
}
