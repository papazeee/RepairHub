import { api, toastError, toastSuccess } from './api.js';

function inferModel(text) {
  const trimmed = text.trim();
  return trimmed || 'Unknown model';
}

const form = document.getElementById('repair-booking-form');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const deviceType = document.getElementById('device-type').value;
  const deviceMakeModel = document.getElementById('device-make-model').value;
  const problemDescription = document.getElementById('problem-description').value.trim();
  const problemStart = document.getElementById('problem-start').value.trim();
  const problemTrigger = document.getElementById('problem-trigger').value.trim();
  const problemChange = document.getElementById('problem-change').value;
  const previousRepairs = document.getElementById('previous-repairs').value.trim();
  const openedBefore = document.getElementById('opened-before').value;
  const deviceLocked = document.getElementById('device-locked').value;
  const bookingMethod = document.getElementById('booking-method').value;
  const contactMethod = document.getElementById('contact-method').value;
  const contactDetails = document.getElementById('contact-details').value.trim();
  const additionalNotes = document.getElementById('additional-notes').value.trim();

  const payload = {
    device_type: deviceType,
    brand: deviceMakeModel.split(/\s+/)[0] || 'Other',
    model: inferModel(deviceMakeModel),
    problem_description: [
      problemDescription,
      problemStart ? `Started: ${problemStart}` : '',
      problemTrigger ? `Before it started: ${problemTrigger}` : '',
      problemChange ? `Status: ${problemChange}` : '',
      previousRepairs ? `Previous repairs: ${previousRepairs}` : '',
      openedBefore ? `Opened before: ${openedBefore}` : '',
      deviceLocked ? `Locked: ${deviceLocked}` : '',
      bookingMethod ? `Booking method: ${bookingMethod}` : '',
      contactMethod ? `Contact method: ${contactMethod}` : '',
      contactDetails ? `Contact: ${contactDetails}` : '',
      additionalNotes ? `Notes: ${additionalNotes}` : '',
    ].filter(Boolean).join(' | '),
  };

  try {
    await api('/repair-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toastSuccess('Booking submitted successfully');
    form.reset();
    window.location.href = 'my-orders.html';
  } catch (err) {
    toastError(err.message || 'Failed to submit booking');
  } finally {
    submitButton.disabled = false;
  }
});