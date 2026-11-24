export function formatearFechaHora(valor: number | string) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" });
}
