const baseUrl =
  "https://3151de04-72ef-4cfe-a32e-1b7d24b3f829-00-x6mg4vwn74xx.picard.replit.dev";
const token = localStorage.getItem("token");

// if (!token) window.location.href = "/login.html";

let editMode = {
  active: false,
  sectionId: null,
  itemId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    { id: "services", fields: ["title", "description"], hasImage: false },
    {
      id: "trainers",
      fields: ["name", "specialization", "imageUrl"],
      hasImage: true,
    },
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

  const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
  renderTable(localData, tableBody, fields, sectionId);
  await loadSectionData(sectionId, tableBody, fields, storageKey);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputs = Array.from(
      form.querySelectorAll("input:not([type=file]), textarea")
    );
    const values = inputs.map((input) => input.value.trim());

    if (values.some((val) => val === "")) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    let imageUrl = "";
    if (hasImage) {
      const imageInput = form.querySelector('input[type="file"]');
      const file = imageInput.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch(`${baseUrl}/api/${sectionId}/upload-image`, {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "فشل رفع الصورة");

          imageUrl = data.imageUrl;
        } catch (err) {
          console.error("خطأ في رفع الصورة:", err);
          alert("خطأ في رفع الصورة: " + (err.message || ""));
          return;
        }
      }
    }

    const bodyData = {};
    fields.forEach((field, i) => {
      bodyData[field] = field === "imageUrl" ? imageUrl : values[i];
    });

    if (hasImage && !imageUrl && editMode.active) {
      bodyData.imageUrl = getItemFromStorage(sectionId, editMode.itemId)?.imageUrl || "";
    }

    try {
      const url = editMode.active
        ? `${baseUrl}/api/${sectionId}/${editMode.itemId}`
        : `${baseUrl}/api/${sectionId}`;

      const res = await fetch(url, {
        method: editMode.active ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "خطأ في الحفظ");

      await loadSectionData(sectionId, tableBody, fields, storageKey);

      inputs.forEach((input) => (input.value = ""));
      if (hasImage) form.querySelector('input[type="file"]').value = "";

      editMode = { active: false, sectionId: null, itemId: null };
    } catch (err) {
      console.error("خطأ أثناء الحفظ:", err);
      alert("خطأ أثناء الحفظ: " + (err.message || ""));
    }
  });
}

function getItemFromStorage(sectionId, itemId) {
  const storageKey = `spider_${sectionId}_data`;
  const data = JSON.parse(localStorage.getItem(storageKey) || "[]");
  return data.find((item) => item._id === itemId);
}

async function loadSectionData(sectionId, tbody, fields, storageKey) {
  try {
    const res = await fetch(`${baseUrl}/api/${sectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "فشل تحميل البيانات");

    tbody.innerHTML = "";
    renderTable(data, tbody, fields, sectionId);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (err) {
    console.error(`فشل تحميل بيانات ${sectionId}:`, err);
  }
}

function renderTable(data, tbody, fields, sectionId) {
  tbody.innerHTML = "";
  data.forEach((item) => {
    const values = fields.map((f) => item[f]);
    addRow(tbody, values, sectionId, item._id, item);
  });
}

function addRow(tbody, values, sectionId, id, originalItem) {
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
    img.style.objectFit = "cover";
    const imgCell = document.createElement("td");
    imgCell.appendChild(img);
    row.appendChild(imgCell);
  } else {
    values.forEach((val) => row.appendChild(createCell(val)));
  }

  const actionCell = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.textContent = "حذف";
  delBtn.onclick = () => handleDelete(id, sectionId, row, tbody);
  actionCell.appendChild(delBtn);

  const editBtn = document.createElement("button");
  editBtn.textContent = "تعديل";
  editBtn.onclick = () => handleEdit(sectionId, originalItem);
  actionCell.appendChild(editBtn);

  row.appendChild(actionCell);
  tbody.appendChild(row);
}

function handleEdit(sectionId, item) {
  const section = document.getElementById(sectionId);
  const form = section.querySelector("form");
  const inputs = Array.from(
    form.querySelectorAll("input:not([type=file]), textarea")
  );

  inputs.forEach((input) => {
    input.value = item[input.name] || "";
  });

  editMode = { active: true, sectionId: sectionId, itemId: item._id };
  window.scrollTo({ top: section.offsetTop - 100, behavior: "smooth" });
}

async function handleDelete(id, sectionId, row, tbody) {
  const storageKey = `spider_${sectionId}_data`;

  try {
    const res = await fetch(`${baseUrl}/api/${sectionId}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "فشل في الحذف");
    }

    row.remove();
    renumberRows(tbody);

    const newData = JSON.parse(localStorage.getItem(storageKey) || "[]").filter(
      (item) => item._id !== id
    );
    localStorage.setItem(storageKey, JSON.stringify(newData));
  } catch (err) {
    console.error("خطأ في حذف العنصر:", err);
    alert("فشل في حذف العنصر: " + (err.message || ""));
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

function toggleNav() {
  document.getElementById("main-nav").classList.toggle("open");
}

document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      const offset = 500;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      document.getElementById("main-nav").classList.remove("open");
    }
  });
});
