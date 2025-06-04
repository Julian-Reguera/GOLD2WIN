package es.ucm.fdi.iw.model;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporte implements Transferable<Reporte.Transfer> {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gen")
    @SequenceGenerator(name = "gen", sequenceName = "gen")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_reportador")
    private User reportador;

    @ManyToOne
    @JoinColumn(name = "id_mensaje")
    private Mensaje mensajeReportado;

    private String motivo;
    private OffsetDateTime fechaEnvio;
    private boolean resuelto;
    private OffsetDateTime fechaResolucion;

    @Getter
    @AllArgsConstructor
    public static class Transfer {
        private long id;
	    private String usuarioReportado;
        private String fechaReporte;
        private boolean resuelto;
        private String fechaResolucion;
        private String mensaje;
    }

    @Override
    public Transfer toTransfer() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String fechaReporte = fechaEnvio != null ? fechaEnvio.format(formatter) : "N/A";
        String resolucion = resuelto && fechaResolucion != null ? fechaResolucion.format(formatter) : "Sin resolver";

        return new Transfer(
            id,
            mensajeReportado.getRemitente().getUsername(),
            fechaReporte,
            resuelto,
            resolucion,
            mensajeReportado.getContenido()
        );
    }
}
