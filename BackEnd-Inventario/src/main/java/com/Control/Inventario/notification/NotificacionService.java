package com.Control.Inventario.notification;

public interface NotificacionService {

    /**
     * @param destinatario El email o el número de teléfono.
     * @param asunto El título del mensaje.
     * @param mensajeIA El texto inteligente generado por Gemini.
     * @param archivoExcel El archivo en bytes generado por Apache POI.
     * @param nombreArchivo El nombre que tendrá el archivo al descargarse.
     */
    void enviarReporte(String destinatario, String asunto, String mensajeIA, byte[] archivoExcel, String nombreArchivo);
}