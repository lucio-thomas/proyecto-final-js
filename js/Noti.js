
/**
 * Objeto notificador
 * */
class Noti {

  /**
   * @param [text] - Texto del mensaje
   * @param [title=] - Titulo de la alerta
   */
  static infoAlert(text, title){
    
    Swal.fire({
      title: title || 'Advertencia',
      text: text,
      icon: 'info',
      confirmButtonText: 'ok'
    })
  }

    /**
   * @param [text] - Texto del mensaje
   * @param [title=] - Titulo de la alerta
   */
  static error(text, title){
    
    Swal.fire({
      title: title || 'Error',
      text: text,
      icon: 'error',
      confirmButtonText: 'ok'
    })
  }

    /**
   * @param [text] - Texto del mensaje
   * @param [title=] - Titulo de la alerta
   */
  static ok(text, title){
    
    Swal.fire({
      title: title || 'Advertencia',
      text: text,
      icon: 'success',
      confirmButtonText: 'ok'
    })
  }

  static obtenerConstraseña(callback){
    Swal.fire({
      title: 'Ingrese constraseña',
      input: 'password',
      allowOutsideClick : false,
      allowEscapeKey : false, 
      inputLabel: 'Constraseña',
      inputPlaceholder: 'Ingrese constraseña',
      inputAttributes: {
        maxlength: 10,
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    }).then(x=>callback(null, x)).catch(callback);
  }

  static obtenerTexto(text, callback){
    Swal.fire({
      title: 'Ingrese '+text,
      input: 'text',
      allowOutsideClick : false,
      allowEscapeKey : false, 
      inputLabel: text,
      inputPlaceholder: 'Ingrese ' + text,
      inputAttributes: {
        maxlength: 50,
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    }).then(x=>callback(null, x)).catch(callback);
  }
}