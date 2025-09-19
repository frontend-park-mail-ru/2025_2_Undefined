document.addEventListener('DOMContentLoaded', () => {
  console.log('SPA app is runnung');

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('click', () => {
      alert('Hello world!');
    });
  }
});
