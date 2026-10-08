
package com.estateflow.property.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.estateflow.common.exception.BadRequestException;

@Service
public class PropertyImageStorageService {

	private static final long MAX_SIZE = 5L * 1024 * 1024;
	private static final Set<String> TYPES = Set.of("image/jpeg", "image/png", "image/webp");

	private final Path uploadDirectory;

	public PropertyImageStorageService(@Value("${app.upload.dir:uploads/property-images}") String directory) {
		this.uploadDirectory = Path.of(directory).toAbsolutePath().normalize();
	}

	public String store(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("Image file is required");
		}

		if (file.getSize() > MAX_SIZE) {
			throw new BadRequestException("Maximum image size is 5 MB");
		}

		String type = file.getContentType();

		if (type == null || !TYPES.contains(type)) {
			throw new BadRequestException("Only JPEG, PNG and WebP images are allowed");
		}

		String extension;

		try (InputStream input = file.getInputStream()) {
			byte[] header = input.readNBytes(12);

			extension = detectExtension(header);

			if (extension == null || !matchesType(type, extension)) {
				throw new BadRequestException("Invalid image content");
			}

			Files.createDirectories(uploadDirectory);

			String filename = UUID.randomUUID() + "." + extension;
			Path destination = uploadDirectory.resolve(filename);

			// Write to a temporary file before publishing.
			Path temp = Files.createTempFile(uploadDirectory, "upload-", ".tmp");

			try {
				try (InputStream fullInput = file.getInputStream()) {
					Files.copy(fullInput, temp, StandardCopyOption.REPLACE_EXISTING);
				}

				Files.move(temp, destination);
			} finally {
				Files.deleteIfExists(temp);
			}

			return "/api/v1/property-images/files/" + filename;

		} catch (IOException ex) {
			throw new IllegalStateException("Could not store image", ex);
		}
	}

	public Path resolve(String filename) {
		if (!filename.matches("[a-fA-F0-9-]{36}\\.(jpg|png|webp)")) {
			throw new BadRequestException("Invalid image filename");
		}

		return uploadDirectory.resolve(filename).normalize();
	}

	public void deleteStoredFile(String imageUrl) {
		String prefix = "/api/v1/property-images/files/";

		if (imageUrl == null || !imageUrl.startsWith(prefix)) {
			return; // Do not delete external image URLs.
		}

		try {
			Files.deleteIfExists(resolve(imageUrl.substring(prefix.length())));
		} catch (IOException ex) {
			throw new IllegalStateException("Could not delete image", ex);
		}
	}

	private String detectExtension(byte[] h) {
		if (h.length >= 3 && (h[0] & 0xff) == 0xff && (h[1] & 0xff) == 0xd8 && (h[2] & 0xff) == 0xff) {
			return "jpg";
		}

		if (h.length >= 8 && (h[0] & 0xff) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
			return "png";
		}

		if (h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F' && h[8] == 'W' && h[9] == 'E'
				&& h[10] == 'B' && h[11] == 'P') {
			return "webp";
		}

		return null;
	}

	private boolean matchesType(String type, String extension) {
		return switch (type) {
		case "image/jpeg" -> extension.equals("jpg");
		case "image/png" -> extension.equals("png");
		case "image/webp" -> extension.equals("webp");
		default -> false;
		};
	}
}
