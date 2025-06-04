package es.ucm.fdi.iw.controller;

import es.ucm.fdi.iw.LocalData;
import es.ucm.fdi.iw.model.User;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;

import java.io.*;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * User management.
 *
 * Access to this end-point is authenticated.
 */
@Controller()
@RequestMapping("user")
public class UserController {

	private static final Logger log = LogManager.getLogger(UserController.class);

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private LocalData localData;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private PasswordEncoder passwordEncoder;

    private final AdminController adminController;


	@ModelAttribute
	public void populateModel(HttpSession session, Model model) {
		for (String name : new String[] { "u", "url", "ws", "topics" }) {
			model.addAttribute(name, session.getAttribute(name));
		}
	}

	UserController(AdminController adminController) {
        this.adminController = adminController;
    }

	/**
	 * Exception to use when denying access to unauthorized users.
	 * 
	 * In general, admins are always authorized, but users cannot modify
	 * each other's profiles.
	 */
	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "No eres administrador, y éste no es tu perfil") // 403
	public static class NoEsTuPerfilException extends RuntimeException {
	}

	/**
	 * Encodes a password, so that it can be saved for future checking. Notice
	 * that encoding the same password multiple times will yield different
	 * encodings, since encodings contain a randomly-generated salt.
	 * 
	 * @param rawPassword to encode
	 * @return the encoded password (typically a 60-character string)
	 *         for example, a possible encoding of "test" is
	 *         {bcrypt}$2y$12$XCKz0zjXAP6hsFyVc8MucOzx6ER6IsC1qo5zQbclxhddR1t6SfrHm
	 */
	public String encodePassword(String rawPassword) {
		return passwordEncoder.encode(rawPassword);
	}

	/**
	 * Generates random tokens. From https://stackoverflow.com/a/44227131/15472
	 * 
	 * @param byteLength
	 * @return
	 */
	public static String generateRandomBase64Token(int byteLength) {
		SecureRandom secureRandom = new SecureRandom();
		byte[] token = new byte[byteLength];
		secureRandom.nextBytes(token);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(token); // base64 encoding
	}

	/**
	 * Landing page for a user profile
	 */
	@GetMapping("{id}")
	public String index(@PathVariable long id, Model model, HttpSession session) {
		User user = entityManager.find(User.class, 
            ((User) session.getAttribute("u")).getId());

        if(id == user.getId()) {
			Long numChats = entityManager.createNamedQuery("User.countChats", Long.class)
            .setParameter("id", user.getId())
            .getSingleResult();

			Long numApuestas = entityManager.createNamedQuery("User.countApuestas", Long.class)
				.setParameter("id", user.getId())
				.getSingleResult();

			Long numApuestasPend = entityManager.createNamedQuery("User.countApuestasPend", Long.class)
				.setParameter("id", user.getId())
				.getSingleResult();    
			
			Long numMensajes = entityManager.createNamedQuery("User.countMensajes", Long.class)
				.setParameter("id", user.getId())
				.getSingleResult();

			model.addAttribute("user", user);  
			model.addAttribute("numChats", numChats);
			model.addAttribute("numApuestas", numApuestas);  
			model.addAttribute("numApuestasPend", numApuestasPend);
			model.addAttribute("numMensajes", numMensajes);
			return "user";
		} else {
			Long numChats = entityManager.createNamedQuery("User.countChats", Long.class)
            .setParameter("id", id)
            .getSingleResult();

			Long numApuestas = entityManager.createNamedQuery("User.countApuestas", Long.class)
				.setParameter("id", id)
				.getSingleResult();

			Long numApuestasPend = entityManager.createNamedQuery("User.countApuestasPend", Long.class)
				.setParameter("id", id)
				.getSingleResult();    
			
			Long numMensajes = entityManager.createNamedQuery("User.countMensajes", Long.class)
				.setParameter("id", id)
				.getSingleResult();

			User target = entityManager.find(User.class, id);
			model.addAttribute("user", target);  
			model.addAttribute("numChats", numChats);
			model.addAttribute("numApuestas", numApuestas);  
			model.addAttribute("numApuestasPend", numApuestasPend);
			model.addAttribute("numMensajes", numMensajes);
			return "userExterno";
		}
	}

	@GetMapping("/verificarUsername")
    public ResponseEntity<?> verificarUsername(@RequestParam String username, @RequestParam Long id) {
        Long countUsername = entityManager
            .createNamedQuery("User.existeUsername", Long.class)
            .setParameter("username", username).setParameter("id", id).getSingleResult();

        boolean existe = countUsername > 0; // Si el numero es mayor a 0, ya existe

        return ResponseEntity.ok().body("{\"existe\": " + existe + "}");
    }

    @GetMapping("/verificarEmail")
    public ResponseEntity<?> verificarEmail(@RequestParam String email, @RequestParam Long id) {
        Long countEmail = entityManager
            .createNamedQuery("User.existeEmail", Long.class)
            .setParameter("email", email).setParameter("id", id).getSingleResult();

        boolean existe = countEmail > 0; // Si el numero es mayor a 0, ya existe

        return ResponseEntity.ok().body("{\"existe\": " + existe + "}");
    }

	//Editar perfil de usuario
	@PostMapping("/{id}")
	@Transactional
	@ResponseBody
	public Map<String, Object> postUser(
			HttpServletResponse response,
			@PathVariable long id,
			@RequestBody JsonNode o,
			Model model, HttpSession session) throws IOException {

		Map<String, Object> respuesta = new HashMap<>();
		User requester = (User) session.getAttribute("u");
		User target = null;

		String username = o.get("username").asText();
		String email = o.get("email").asText();

		// retrieve requested user
		target = entityManager.find(User.class, id);
		model.addAttribute("user", target);

		if (requester.getId() != target.getId()) {
			throw new NoEsTuPerfilException();
		}

		Long countUsername = entityManager
            .createNamedQuery("User.existeUsername", Long.class)
            .setParameter("username", username).setParameter("id", target.getId()).getSingleResult();
		
		if (countUsername > 0) {
            respuesta.put("success", false);
            respuesta.put("error", "username");
            return respuesta;
        }

		Long countEmail = entityManager
            .createNamedQuery("User.existeEmail", Long.class)
            .setParameter("email", email).setParameter("id", target.getId()).getSingleResult();

		if (countEmail > 0) {
            respuesta.put("success", false);
            respuesta.put("error", "email");
            return respuesta;
        }

		target.setUsername(username);
        target.setEmail(email);

		// update user session so that changes are persisted in the session, too
		if (requester.getId() == target.getId()) {
			session.setAttribute("u", target);
		}

		respuesta.put("success", true);
        return respuesta;
	}

	//Guardamos la contraseña del usuario en un post aparte
	@PostMapping("/{id}/password")
	@Transactional
	public String postPassword(
			HttpServletResponse response,
			@PathVariable long id,
			@RequestBody JsonNode o,
			Model model, HttpSession session) throws IOException {

		User requester = (User) session.getAttribute("u");
		User target = null;
		String password = o.get("password").asText();

		// retrieve requested user
		target = entityManager.find(User.class, id);
		model.addAttribute("user", target);

		if (requester.getId() != target.getId()) {
			throw new NoEsTuPerfilException();
		}

		log.info("Updating password for user {}", id);
		target.setPassword(encodePassword(password));

		// update user session so that changes are persisted in the session, too
		if (requester.getId() == target.getId()) {
			session.setAttribute("u", target);
		}

		return "Ok";
	}

	/**
	 * Returns the default profile pic
	 * 
	 * @return
	 */
	private static InputStream defaultPic() {
		return new BufferedInputStream(Objects.requireNonNull(
				UserController.class.getClassLoader().getResourceAsStream(
						"static/img/default-pic.jpg")));
	}

	/**
	 * Downloads a profile pic for a user id
	 * 
	 * @param id
	 * @return
	 * @throws IOException
	 */
	@GetMapping("{id}/pic")
	public StreamingResponseBody getPic(@PathVariable long id) throws IOException {
		File f = localData.getFile("user", "" + id + ".jpg");
		InputStream in = new BufferedInputStream(f.exists() ? new FileInputStream(f) : UserController.defaultPic());
		return os -> FileCopyUtils.copy(in, os);
	}

	/**
	 * Uploads a profile pic for a user id
	 * 
	 * @param id
	 * @return
	 * @throws IOException
	 */
	@PostMapping("{id}/pic")
	@Transactional
	@ResponseBody
	public Map<String, Object> setPic(@RequestBody JsonNode o, @PathVariable long id,
			HttpServletResponse response, HttpSession session, Model model) throws IOException {
		Map<String, Object> respuesta = new HashMap<>();

		User target = entityManager.find(User.class, id);
		model.addAttribute("user", target);

		// check permissions
		User requester = (User) session.getAttribute("u");
		if (requester.getId() != target.getId()) {
			throw new NoEsTuPerfilException();
		}

		log.info("Updating photo for user {}", id);

		JsonNode imageDataNode = o.get("imageData");
        if (imageDataNode != null && imageDataNode.has("image") && !imageDataNode.get("image").isNull()) {
            String base64Image = imageDataNode.get("image").asText();
            String filename = imageDataNode.has("filename") ? imageDataNode.get("filename").asText() : "";

            if (!base64Image.isEmpty()) {
                MultipartFile photo = adminController.convertirBase64AMultipartFile(base64Image, filename);
                adminController.setPic(photo, "user", "" + requester.getId());
            }
        }

        respuesta.put("success", true);

		return respuesta;
	}
}
