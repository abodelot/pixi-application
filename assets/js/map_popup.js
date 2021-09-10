function mapPopupOnSubmit() {
  const form = document.forms.mapForm.elements;
  const event = new CustomEvent('map_popup_submit', {
    detail: {
      functionName: form.functionName.value,
      scale: parseInt(form.scale.value, 10),
      minNoise: parseFloat(form.minNoise.value),
      maxNoise: parseFloat(form.maxNoise.value),
    },
  });
  document.dispatchEvent(event);
  document.querySelector('#popup-wrapper').innerHTML = '';
}

function mapPopupOnCancel() {
  document.querySelector('#popup-wrapper').innerHTML = '';
}
