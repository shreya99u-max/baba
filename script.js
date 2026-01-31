// Step-by-step data object build karte hain
let serviceData = JSON.parse(localStorage.getItem('bikeServiceData')) || {};

// Function to save current step and redirect
function saveAndRedirect(nextPage) {
  localStorage.setItem('bikeServiceData', JSON.stringify(serviceData));
  window.location.href = nextPage;
}

// Admin page pe data load (real mein Worker se fetch karoge)
function loadAdminData() {
  const data = JSON.parse(localStorage.getItem('bikeServiceData')) || {};
  const tableBody = document.getElementById('dataTable');
  if (tableBody && Object.keys(data).length > 0) {
    tableBody.innerHTML = `
      <tr><td>${data.mobile || '-'}</td>
          <td>${data.userid || '-'}</td>
          <td>${data.oilserial || '-'}</td>
          <td>${data.brand || '-'} / ${data.model || '-'}</td>
          <td>\( {data.pancharname || '-'} ( \){data.pancherno || '-'})</td>
          <td>${data.oilfilterno || '-'}</td></tr>`;
  } else if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No service data yet</td></tr>';
  }
                }
