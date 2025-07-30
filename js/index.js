document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const senha = document.getElementById("senha").value.trim();


    if (senha !== "") { // Verifica se a senha é diferente Adri0707
        alert("Senha inválida");
    } else {
        window.location.href = "html/festas.html";
    }
});