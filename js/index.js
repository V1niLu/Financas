document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const senha = document.getElementById("senha").value.trim();


    if (senha !== "Adri0707") {
        const menssagem = document.getElementById("menssagem");
        menssagem.innerText = "Senha Inválida";
    } else {
        window.location.href = "html/festas.html";
    }
});