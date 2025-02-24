const form = document.getElementById('registro');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const contraseña = document.getElementById('contraseña').value;
    const confirmar_contraseña = document.getElementById('confirmar_contraseña').value;

    if (contraseña !== confirmar_contraseña) {
        alert('Las contraseñas no coinciden');
        return;
    }

    const usuario = { nombre, apellido, email, contraseña };

    try {
        const response = await fetch('http://localhost:5001/registro', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Usuario registrado exitosamente');
            form.reset();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert('Error al registrar el usuario');
    }
});