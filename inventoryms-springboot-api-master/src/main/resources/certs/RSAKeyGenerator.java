import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.io.FileWriter;

public class RSAKeyGenerator {
    public static void main(String[] args) throws Exception {
        // Generate RSA Key Pair
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();

        PrivateKey privateKey = keyPair.getPrivate();
        PublicKey publicKey = keyPair.getPublic();

        // Save Private Key (PKCS#8 format)
        String privateKeyPem = "-----BEGIN PRIVATE KEY-----\n" +
                Base64.getMimeEncoder().encodeToString(privateKey.getEncoded()) +
                "\n-----END PRIVATE KEY-----";
        writeToFile("src/main/resources/certs/private.pem", privateKeyPem);

        // Save Public Key
        String publicKeyPem = "-----BEGIN PUBLIC KEY-----\n" +
                Base64.getMimeEncoder().encodeToString(publicKey.getEncoded()) +
                "\n-----END PUBLIC KEY-----";
        writeToFile("src/main/resources/certs/public.pem", publicKeyPem);

        System.out.println("Keys generated successfully!");
    }

    private static void writeToFile(String path, String content) throws Exception {
        try (FileWriter writer = new FileWriter(path)) {
            writer.write(content);
        }
    }
}