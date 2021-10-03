console.log("Start Up");

let usua = window.prompt("ingrese su nombre de usuario");
const MENSAJE = "BIENVENID@ "

if(usua !== ""){
    alert(MENSAJE + usua)
};


/*
const app = {};
app.__q = ["Nombre", "Apellido", "DNI", "Edad", "Carrera"];
app._datos = [];
app._reg = {};


app._pedirDato = function(qIdx){
    qIdx = qIdx || 0;
    const val = window.prompt("Ingrese " + app.__q[qIdx] + ":");
    app._reg[app.__q[qIdx]] = val;
    if(val == ""){
        alert("BIENVENIDO")
    }
}
*/ 