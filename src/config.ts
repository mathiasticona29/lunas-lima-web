// Número en formato internacional sin "+" ni espacios (51 + celular).
export const WHATSAPP_NUMBER = '51941197623';

export const WHATSAPP_MESSAGE = 'Hola, quiero sacar mi cita para el permiso de lunas polarizadas';

export function whatsappUrl(message: string = WHATSAPP_MESSAGE): string {
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
