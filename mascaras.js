// Aplica pontuação automática em campos de texto conforme o usuário digita,
// e recalcula o Valor atual (Valor Inicial + aditivos de valor).
// Uso: <input data-mascara="99999.999999/9999-99">
//      <input data-dinheiro>                      (sempre positivo)
//      <input data-dinheiro data-aditivo-valor>    (aceita "-" na frente, para reduções)

function aplicarMascara(valor, mascara) {
  const digitos = valor.replace(/\D/g, '');
  let resultado = '';
  let i = 0;
  for (const caractere of mascara) {
    if (i >= digitos.length) break;
    if (caractere === '9') {
      resultado += digitos[i];
      i++;
    } else {
      resultado += caractere;
    }
  }
  return resultado;
}

function aplicarMascaraDinheiro(valor, permiteNegativo) {
  const negativo = permiteNegativo && valor.trim().startsWith('-');
  let digitos = valor.replace(/\D/g, '');
  if (!digitos) return negativo ? '-' : '';
  digitos = digitos.replace(/^0+(?=\d)/, '');
  while (digitos.length < 3) digitos = '0' + digitos;
  const centavos = digitos.slice(-2);
  const inteiro = digitos.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (negativo ? '-' : '') + 'R$ ' + inteiro + ',' + centavos;
}

function paraNumero(valorFormatado) {
  const negativo = /^\s*-/.test(valorFormatado);
  const limpo = valorFormatado.replace(/[^\d,]/g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  if (isNaN(numero)) return 0;
  return negativo ? -numero : numero;
}

function paraDinheiro(numero) {
  const negativo = numero < 0;
  const formatado = Math.abs(numero).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (negativo ? '-' : '') + 'R$ ' + formatado;
}

function formatarCampo(campo) {
  const mascara = campo.getAttribute('data-mascara');
  if (mascara) {
    campo.value = aplicarMascara(campo.value, mascara);
  } else if (campo.hasAttribute('data-dinheiro')) {
    campo.value = aplicarMascaraDinheiro(campo.value, campo.hasAttribute('data-aditivo-valor'));
  }
}

function recalcularValorDefinitivo() {
  const campoAtual = document.getElementById('valor-inicial');
  const campoFinal = document.getElementById('valor-final');
  if (!campoAtual || !campoFinal) return;
  let total = paraNumero(campoAtual.value);
  document.querySelectorAll('[data-aditivo-valor]').forEach(function (campo) {
    total += paraNumero(campo.value);
  });
  campoFinal.value = paraDinheiro(total);
}

document.addEventListener('input', function (evento) {
  const campo = evento.target;
  if (campo.hasAttribute('data-mascara') || campo.hasAttribute('data-dinheiro')) {
    formatarCampo(campo);
  }
  if (campo.id === 'valor-inicial' || campo.hasAttribute('data-aditivo-valor')) {
    recalcularValorDefinitivo();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-mascara], [data-dinheiro]').forEach(function (campo) {
    if (campo.value) formatarCampo(campo);
  });
  recalcularValorDefinitivo();
});
