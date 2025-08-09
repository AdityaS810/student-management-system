const studentTableBody = document.querySelector('#studentTable tbody');
const searchInput = document.getElementById('search');
const filterYear = document.getElementById('filterYear');
const filterCourse = document.getElementById('filterCourse');
const studentFormModal = document.getElementById('studentFormModal');
const studentForm = document.getElementById('studentForm');
const formError = document.getElementById('formError');
const modalTitle = studentFormModal.querySelector('h2');

let students = [];
let editId = null;
let sortState = { column: null, direction: 0 };

async function fetchStudents() {
  try {
    const res = await fetch('php/students_fetch.php');
    if (!res.ok) {
      if (res.status === 401) window.location.href = 'login.html';
      throw new Error('Failed to fetch students.');
    }
    students = await res.json();
    generateFilterOptions();
    renderTable();
  } catch {
    alert('Failed to load students. Please login again.');
    window.location.href = 'login.html';
  }
}

function generateFilterOptions() {
  const years = new Set();
  const courses = new Set();

  students.forEach(s => {
    if (s.year) years.add(String(s.year));
    if (s.course) courses.add(s.course);
  });

  filterYear.innerHTML = '<option value="">All Years</option>';
  filterCourse.innerHTML = '<option value="">All Courses</option>';

  Array.from(years).sort().forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    filterYear.appendChild(option);
  });

  Array.from(courses).sort().forEach(course => {
    const option = document.createElement('option');
    option.value = course;
    option.textContent = course;
    filterCourse.appendChild(option);
  });

  // Course datalist
  const courseList = document.getElementById('courseList');
  if (courseList) {
    courseList.innerHTML = '';
    Array.from(courses).sort().forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      courseList.appendChild(option);
    });
  }
}

function renderTable() {
  const searchVal = searchInput.value.trim().toLowerCase();
  const filterYearVal = filterYear.value;
  const filterCourseVal = filterCourse.value;

  let filtered = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchVal);
    const matchesYear = !filterYearVal || String(student.year) === filterYearVal;
    const matchesCourse = !filterCourseVal || student.course === filterCourseVal;
    return matchesSearch && matchesYear && matchesCourse;
  });

  if (sortState.column && sortState.direction !== 0) {
    filtered.sort((a, b) => {
      let valA = a[sortState.column] ?? '';
      let valB = b[sortState.column] ?? '';
      if (sortState.column === "year") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }
      if (valA < valB) return -sortState.direction;
      if (valA > valB) return sortState.direction;
      return 0;
    });
  }

  studentTableBody.innerHTML = '';

  if (filtered.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" style="text-align:center; font-style:italic; color:#888;">No students found.</td>`;
    studentTableBody.appendChild(row);
    return;
  }

  filtered.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>${student.course}</td>
      <td>${student.year}</td>
      <td>${student.email}</td>
      <td>
        <button class="btn-action" aria-label="Edit ${student.name}" title="Edit" onclick="editStudent(${student.id})">✏️</button>
        <button class="btn-action" aria-label="Delete ${student.name}" title="Delete" onclick="deleteStudent(${student.id})">🗑️</button>
      </td>
    `;
    studentTableBody.appendChild(row);
  });

  updateSortIcons();
}

function updateSortIcons() {
  document.querySelectorAll('#studentTable th[data-sort]').forEach(th => {
    const col = th.getAttribute('data-sort');
    if (col === sortState.column) {
      if (sortState.direction === 1) th.setAttribute('aria-sort', 'ascending');
      else if (sortState.direction === -1) th.setAttribute('aria-sort', 'descending');
      else th.setAttribute('aria-sort', 'none');
    } else {
      th.setAttribute('aria-sort', 'none');
    }
  });
}

searchInput.addEventListener('input', renderTable);
filterYear.addEventListener('change', renderTable);
filterCourse.addEventListener('change', renderTable);

document.querySelectorAll('#studentTable th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.getAttribute('data-sort');
    if (sortState.column !== col) {
      sortState.column = col;
      sortState.direction = 1;
    } else {
      sortState.direction = sortState.direction === 1 ? -1 : (sortState.direction === -1 ? 0 : 1);
    }
    renderTable();
  });
  th.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      th.click();
    }
  });
});

function showAddForm() {
  editId = null;
  modalTitle.textContent = 'Add Student';
  studentForm.reset();
  formError.textContent = '';
  studentFormModal.setAttribute('aria-hidden', 'false');
  studentFormModal.style.display = 'flex';
  studentForm.studentRoll.focus();
}

function closeForm() {
  studentFormModal.setAttribute('aria-hidden', 'true');
  studentFormModal.style.display = 'none';
  formError.textContent = '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

studentForm.addEventListener('submit', async e => {
  e.preventDefault();

  const studentData = {
    roll: studentForm.studentRoll.value.trim(),
    name: studentForm.studentName.value.trim(),
    course: studentForm.studentCourse.value.trim(),
    year: Number(studentForm.studentYear.value),
    email: studentForm.studentEmail.value.trim()
  };

  if (!studentData.roll || !studentData.name || !studentData.course || !studentData.year || !studentData.email) {
    formError.textContent = 'Please fill all fields.';
    return;
  }
  if (studentData.year < 2020 || studentData.year > 2025 || isNaN(studentData.year)) {
    formError.textContent = 'Year must be between 2020 and 2025.';
    return;
  }
  if (!isValidEmail(studentData.email)) {
    formError.textContent = 'Invalid email address.';
    return;
  }

  formError.textContent = 'Saving...';

  let url = 'php/student_add.php';
  if (editId !== null) {
    url = 'php/student_edit.php';
    studentData.id = editId;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (data.success) {
      closeForm();
      await fetchStudents();
    } else {
      formError.textContent = data.message || 'Failed to save student.';
    }
  } catch {
    formError.textContent = 'Network error.';
  }
});

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  editId = id;
  modalTitle.textContent = 'Edit Student';
  studentForm.studentRoll.value = student.roll;
  studentForm.studentName.value = student.name;
  studentForm.studentCourse.value = student.course;
  studentForm.studentYear.value = student.year;
  studentForm.studentEmail.value = student.email;
  formError.textContent = '';
  studentFormModal.setAttribute('aria-hidden', 'false');
  studentFormModal.style.display = 'flex';
  studentForm.studentRoll.focus();
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    const res = await fetch('php/student_delete.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchStudents();
    } else {
      alert(data.message || 'Failed to delete student.');
    }
  } catch {
    alert('Network error during delete.');
  }
}

window.showAddForm = showAddForm;
window.closeForm = closeForm;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;

fetchStudents();
