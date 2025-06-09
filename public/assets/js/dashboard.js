const baseUrl = "https://3151de04-72ef-4cfe-a32e-1b7d24b3f829-00-x6mg4vwn74xx.picard.replit.dev";
const token = localStorage.getItem("token");

if (!token) window.location.href = "/login.html";

document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    { id: "services", fields: ["title", "description"], hasImage: false },
    { id: "trainers", fields: ["name", "specialty", "imageUrl"], hasImage: true },
    { id: "testimonials", fields: ["author", "content"], hasImage: false },
    { id: "lastnews", fields: ["title", "summary"], hasImage: false },
    { id: "subscriptions", fields: ["plan", "price"], hasImage: false },
  ];

  sections.forEach(({ id, fields, hasImage }) => {
    setupSection(id, fields, hasImage);
  });
});

async function setupSection(sectionId, fields, hasImage) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const form = section.querySelector("form");
  const tableBody = section.querySelector("table tbody");
  const storageKey = `spider_${sectionId}_data`;

  if (!form || !tableBody) return;

  // تحميل بيانات من LocalStorage أولاً
  const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
  renderTable(localData, tableBody, fields, sectionId);

  // ثم تحميل البيانات من الخادم
  await loadSectionData(sectionId, tableBody, fields, storageKey);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = Array.from(form.querySelectorAll("input:not([type=file]), textarea"));
    const values = inputs.map((input) => input.value.trim());

    if (values.some(val => val === "")) return alert("يرجى ملء جميع الحقول");

    let imageUrl = "";
    if (hasImage) {
      const imageInput = form.querySelector('input[type="file"]');
      const file = imageInput.files[0];
      if (!file) return alert("يرجى اختيار صورة.");

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`${baseUrl}/api/${sectionId}/upload-image`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        imageUrl = data.imageUrl;
      } catch {
        return alert("خطأ في رفع الصورة");
      }
    }

    const bodyData = {};
    fields.forEach((field, i) => {
      bodyData[field] = field === "imageUrl" ? imageUrl : values[i];
    });

    try {
      const res = await fetch(`${baseUrl}/api/${sectionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const savedItem = await res.json();
      if (!res.ok) throw new Error(savedItem.message);

      addRow(tableBody, fields.map(f => savedItem[f]), sectionId, savedItem._id);
      updateLocalStorage(storageKey, [...JSON.parse(localStorage.getItem(storageKey) || "[]"), savedItem]);

      inputs.forEach(input => input.value = "");
      if (hasImage) form.querySelector('input[type="file"]').value = "";

    } catch {
      alert("خطأ أثناء الحفظ");
    }
  });
}

async function loadSectionData(sectionId, tbody, fields, storageKey) {
  try {
    const res = await fetch(`${baseUrl}/api/${sectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error();

    tbody.innerHTML = "";
    renderTable(data, tbody, fields, sectionId);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    console.error(`فشل تحميل بيانات ${sectionId}`);
  }
}

function renderTable(data, tbody, fields, sectionId) {
  tbody.innerHTML = "";
  data.forEach(item => {
    const values = fields.map(f => item[f]);
    addRow(tbody, values, sectionId, item._id);
  });
}

function addRow(tbody, values, sectionId, id) {
  const row = document.createElement("tr");
  row.dataset.id = id;

  const numCell = document.createElement("td");
  numCell.textContent = tbody.children.length + 1;
  row.appendChild(numCell);

  if (sectionId === "trainers") {
    row.appendChild(createCell(values[0]));
    row.appendChild(createCell(values[1]));
    const img = document.createElement("img");
    img.src = values[2].startsWith("http") ? values[2] : baseUrl + values[2];
    img.style.width = "80px";
    img.style.height = "80px";
    const imgCell = document.createElement("td");
    imgCell.appendChild(img);
    row.appendChild(imgCell);
  } else {
    values.forEach(val => row.appendChild(createCell(val)));
  }

  const actionCell = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.textContent = "حذف";
  delBtn.onclick = () => handleDelete(id, sectionId, row, tbody);
  actionCell.appendChild(delBtn);
  row.appendChild(actionCell);

  tbody.appendChild(row);
}

async function handleDelete(id, sectionId, row, tbody) {
  const storageKey = `spider_${sectionId}_data`;

  try {
    const res = await fetch(`${baseUrl}/api/${sectionId}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error();

    row.remove();
    renumberRows(tbody);

    const newData = JSON.parse(localStorage.getItem(storageKey) || "[]").filter(item => item._id !== id);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  } catch {
    alert("فشل في حذف العنصر");
  }
}

function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function renumberRows(tbody) {
  Array.from(tbody.children).forEach((row, i) => {
    row.querySelector("td").textContent = i + 1;
  });
}

function updateLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
