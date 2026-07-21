import { useState } from 'react';

const MAX_BYTES = 2 * 1024 * 1024; // coincide con el límite del servidor (~2MB decodificado)

export default function ImageUploadField({ value, onChange }) {
  const [error, setError] = useState('');

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    if (file.size > MAX_BYTES) {
      setError('La imagen pesa más de 2MB. Usa una más ligera o comprímela primero.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange({ dataUrl: reader.result, alt: file.name });
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {value ? (
        <div style={{ marginBottom: 10 }}>
          <img src={value.dataUrl} alt={value.alt} style={{ maxWidth: 240, borderRadius: 8, display: 'block', marginBottom: 8 }} />
          <button type="button" className="secondary" onClick={() => onChange(null)}>
            Quitar imagen
          </button>
        </div>
      ) : (
        <input type="file" accept="image/*" onChange={handleFile} />
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
