package es.ucm.fdi.iw.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * An authorized user of the system.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedQueries({
        @NamedQuery(name = "User.byUsername", query = "SELECT u FROM User u " +
                "WHERE u.username = :username " +
                "AND u.enabled = TRUE"),
        @NamedQuery(name = "User.hasUsername", query = "SELECT COUNT(u) FROM User u " +
                "WHERE u.username = :username"),
        @NamedQuery(name = "User.getChats", query = "SELECT e FROM User u " +
                "JOIN u.chats e " +
                "WHERE u.id = :id"),
        @NamedQuery(name = "User.estaEnChat", query = "SELECT p FROM ParticipacionChat p " +
                "WHERE p.usuario = :user " +
                "AND p.evento = :evento"),
        @NamedQuery(name = "User.countChats", query = "SELECT COUNT(e) FROM User u " +
                "JOIN u.chats e " +
                "WHERE u.id = :id"),
        @NamedQuery(name = "User.countApuestas", query = "SELECT COUNT(a) FROM User u " +
                "JOIN u.apuestas a " +
                "WHERE u.id = :id"),
        @NamedQuery(name = "User.countApuestasPend", query = "SELECT COUNT(a) FROM User u " +
                "JOIN u.apuestas a " +
                "WHERE u.id = :id " +
                "AND a.formulaApuesta.resultado = 'INDETERMINADO'"),
        @NamedQuery(name = "User.countMensajes", query = "SELECT COUNT(m) FROM User u " +
                "JOIN u.mensajes m " +
                "WHERE u.id = :id"),
        @NamedQuery(name = "User.existeUsername", query = "SELECT COUNT(u) FROM User u " +
                "WHERE u.username = :username " +
                "AND u.id != :id"),
        @NamedQuery(name = "User.existeEmail", query = "SELECT COUNT(u) FROM User u " +
                "WHERE u.email = :email " +
                "AND u.id != :id")
})

@Table(name = "IWUser")
public class User implements Transferable<User.Transfer> {
    public enum Role {
        USER, // normal users
        ADMIN, // admin users
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gen")
    @SequenceGenerator(name = "gen", sequenceName = "gen")
    private long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    private String email;

    private boolean enabled;
    private String roles; // split by ',' to separate roles
    private int dineroDisponible; // En centimos
    private int dineroRetenido; // En centimos
    private OffsetDateTime expulsadoHasta; // Fecha hasta la que el usuario está expulsado

    @OneToMany(mappedBy = "usuario")
    private List<ParticipacionChat> chats;

    @OneToMany(mappedBy = "apostador")
    private List<Apuesta> apuestas;

    @OneToMany(mappedBy = "remitente")
    private List<Mensaje> mensajes;

    /**
     * Checks whether this user has a given role.
     * 
     * @param role to check
     * @return true iff this user has that role.
     */
    public boolean hasRole(Role role) {
        String roleName = role.name();
        return Arrays.asList(roles.split(",")).contains(roleName);
    }

    @Getter
    @AllArgsConstructor
    public static class Transfer {
        private long id;
	private String username;
        private String email;
        private int saldo;
        private String rol;
        private String expulsadoHasta;
    }

    public Transfer toTransfer() {
        String expulsado = null;
        if (expulsadoHasta != null && expulsadoHasta.isAfter(OffsetDateTime.now())) {
                expulsado = expulsadoHasta.toString();
        }
        
        return new Transfer(id, username, email, dineroDisponible, roles, expulsado);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("User{id=").append(id)
          .append(", username='").append(username).append('\'')
          .append(", firstName='").append(firstName).append('\'')
          .append(", lastName='").append(lastName).append('\'')
          .append(", email='").append(email).append('\'')
          .append(", enabled=").append(enabled)
          .append(", roles='").append(roles).append('\'')
          .append(", dineroDisponible=").append(dineroDisponible)
          .append(", dineroRetenido=").append(dineroRetenido)
          .append(", expulsadoHasta=").append(expulsadoHasta)
          .append('}');
        
        return sb.toString();
    }
}
