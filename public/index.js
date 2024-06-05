
document.getElementById('make-session').addEventListener('click', async () => {
    console.log('make-session');
    const response = await fetch('/api/make-session', {
        method: 'POST',
    });
    const session = await response.json();
    console.log(session);
    window.location.href = `/session.html#${session.id}`;
});