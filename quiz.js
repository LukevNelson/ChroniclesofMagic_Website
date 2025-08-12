document.getElementById('quizForm').onsubmit = async function(e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    age: form.age.value,
    q1: form.q1.value,
    q2: form.q2.value,
    q3: form.q3.value
  };

  await fetch('http://localhost:3000/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  window.location.href = "results.html";
};