const form = document.getElementById("appointmentForm");
const patientName = document.getElementById("patientName");
const service = document.getElementById("service");
const date = document.getElementById("date");
const time = document.getElementById("time");
const doctor = document.getElementById("doctor");
const status = document.getElementById("status");
const notes = document.getElementById("notes");
const formMessage = document.getElementById("formMessage");
const clearBtn = document.getElementById("clearBtn");
const filterStatus = document.getElementById("filterStatus");
const appointmentList = document.getElementById("appointmentList");

const totalCount = document.getElementById("totalCount");
const confirmedCount = document.getElementById("confirmedCount");
const pendingCount = document.getElementById("pendingCount");
const todayCount = document.getElementById("todayCount");
const nextAppointment = document.getElementById("nextAppointment");
const topService = document.getElementById("topService");

let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

function saveAppointments() {
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

function clearForm() {
  patientName.value = "";
  service.value = "";
  date.value = "";
  time.value = "";
  doctor.value = "";
  status.value = "";
  notes.value = "";
  formMessage.textContent = "";
}

function validateForm() {
  if (
    !patientName.value.trim() ||
    !service.value ||
    !date.value ||
    !time.value ||
    !doctor.value ||
    !status.value
  ) {
    formMessage.textContent = "Preencha todos os campos obrigatórios.";
    return false;
  }

  const duplicate = appointments.some((appointment) => {
    return (
      appointment.date === date.value &&
      appointment.time === time.value &&
      appointment.doctor === doctor.value
    );
  });

  if (duplicate) {
    formMessage.textContent =
      "Já existe um agendamento para esse profissional nesse horário.";
    return false;
  }

  formMessage.textContent = "";
  return true;
}

function createAppointment() {
  if (!validateForm()) return;

  const newAppointment = {
    id: Date.now(),
    patientName: patientName.value.trim(),
    service: service.value,
    date: date.value,
    time: time.value,
    doctor: doctor.value,
    status: status.value,
    notes: notes.value.trim()
  };

  appointments.push(newAppointment);
  saveAppointments();
  clearForm();
  render();
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function getBadgeClass(statusValue) {
  if (statusValue === "Confirmado") return "confirmed";
  if (statusValue === "Pendente") return "pending";
  return "cancelled";
}

function deleteAppointment(id) {
  appointments = appointments.filter((appointment) => appointment.id !== id);
  saveAppointments();
  render();
}

function toggleStatus(id) {
  appointments = appointments.map((appointment) => {
    if (appointment.id === id) {
      let newStatus = "Confirmado";

      if (appointment.status === "Confirmado") {
        newStatus = "Pendente";
      } else if (appointment.status === "Pendente") {
        newStatus = "Cancelado";
      } else {
        newStatus = "Confirmado";
      }

      return { ...appointment, status: newStatus };
    }

    return appointment;
  });

  saveAppointments();
  render();
}

function getFilteredAppointments() {
  const selectedFilter = filterStatus.value;

  if (selectedFilter === "Todos") {
    return appointments;
  }

  return appointments.filter(
    (appointment) => appointment.status === selectedFilter
  );
}

function renderAppointments() {
  const filtered = getFilteredAppointments();

  if (filtered.length === 0) {
    appointmentList.innerHTML = `
      <div class="empty-state">
        Nenhum agendamento encontrado para esse filtro.
      </div>
    `;
    return;
  }

  const sortedAppointments = [...filtered].sort((a, b) => {
    const first = `${a.date} ${a.time}`;
    const second = `${b.date} ${b.time}`;
    return first.localeCompare(second);
  });

  appointmentList.innerHTML = sortedAppointments
    .map((appointment) => {
      return `
        <div class="appointment-item">
          <div class="appointment-top">
            <div>
              <h4>${appointment.patientName}</h4>
              <p class="appointment-meta">
                ${appointment.service} • ${appointment.doctor}<br />
                ${formatDate(appointment.date)} às ${appointment.time}
              </p>
            </div>

            <span class="badge ${getBadgeClass(appointment.status)}">
              ${appointment.status}
            </span>
          </div>

          ${
            appointment.notes
              ? `<div class="appointment-notes">${appointment.notes}</div>`
              : ""
          }

          <div class="item-actions">
            <button class="small-btn toggle" onclick="toggleStatus(${appointment.id})">
              Alterar status
            </button>
            <button class="small-btn delete" onclick="deleteAppointment(${appointment.id})">
              Excluir
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function updateStats() {
  totalCount.textContent = appointments.length;
  confirmedCount.textContent = appointments.filter(
    (appointment) => appointment.status === "Confirmado"
  ).length;

  pendingCount.textContent = appointments.filter(
    (appointment) => appointment.status === "Pendente"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  todayCount.textContent = appointments.filter(
    (appointment) => appointment.date === today
  ).length;

  const futureAppointments = [...appointments]
    .filter((appointment) => appointment.status !== "Cancelado")
    .sort((a, b) => {
      const first = `${a.date} ${a.time}`;
      const second = `${b.date} ${b.time}`;
      return first.localeCompare(second);
    });

  nextAppointment.textContent =
    futureAppointments.length > 0
      ? `${formatDate(futureAppointments[0].date)} • ${futureAppointments[0].time}`
      : "--";

  if (appointments.length === 0) {
    topService.textContent = "--";
    return;
  }

  const serviceCount = {};

  appointments.forEach((appointment) => {
    serviceCount[appointment.service] =
      (serviceCount[appointment.service] || 0) + 1;
  });

  const mostBooked = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0];
  topService.textContent = mostBooked ? mostBooked[0] : "--";
}

function render() {
  renderAppointments();
  updateStats();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  createAppointment();
});

clearBtn.addEventListener("click", clearForm);
filterStatus.addEventListener("change", render);

render();