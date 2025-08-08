document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const senha = document.getElementById("senha").value.trim();


    if (senha !== "admin") { // Verifica se a senha é diferente admin
        const menssagem = document.getElementById("menssagem");
        menssagem.innerText = "Senha Inválida";
    } else {
        window.location.href = "html/festas.html";
    }
});