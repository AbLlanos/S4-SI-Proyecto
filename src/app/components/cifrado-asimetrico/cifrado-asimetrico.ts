import { Component } from '@angular/core';
import { NavBar } from "../general/nav-bar/nav-bar";
import { Footer } from "../general/footer/footer";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cifrado-asimetrico',
  standalone: true,
  imports: [NavBar, Footer, CommonModule, FormsModule],
  templateUrl: './cifrado-asimetrico.html',
  styleUrls: ['./cifrado-asimetrico.css']
})
export class CifradoAsimetrico {
  archivo: File | null = null;
  textoPlano: string = '';
  estado: string = '';
  resultadoCifrado: string = '';

  clavePublica: string = '';
  clavePrivadaProtegida: string = '';
  fraseLlavePrivada: string = '';
  clavePrivadaDescifrada: string = '';

  privateKeyCrypto?: CryptoKey; 
  publicKeyCrypto?: CryptoKey;

  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();

  onFileSelected(event: any) {
    this.archivo = event.target.files[0] || null;
    this.estado = '';
    this.resultadoCifrado = '';
    this.clavePrivadaDescifrada = '';
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for(let i=0; i<binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer.slice(0);
  }

  private pemEncode(base64key: string, type: string): string {
    const lineLength = 64;
    let lines: string[] = [];
    for (let i = 0; i < base64key.length; i += lineLength) {
      lines.push(base64key.slice(i, i + lineLength));
    }
    return lines.join('\n');
  }

  private async deriveAESKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const pwUtf8 = this.textEncoder.encode(password);
    const pwKey = await window.crypto.subtle.importKey("raw", pwUtf8, "PBKDF2", false, ["deriveKey"]);
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      pwKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async generarParClaves() {
    try {
      if (!this.fraseLlavePrivada || this.fraseLlavePrivada.trim() === '') {
        this.estado = 'Debes ingresar una frase para proteger la clave privada';
        return;
      }
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      this.privateKeyCrypto = keyPair.privateKey;
      this.publicKeyCrypto = keyPair.publicKey;

      // Exportar clave pública
      const spki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const spkiBase64 = this.arrayBufferToBase64(spki);
      this.clavePublica = this.pemEncode(spkiBase64, "PUBLIC KEY");

      const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
      const ivArray = window.crypto.getRandomValues(new Uint8Array(12));

      const aesKey = await this.deriveAESKey(this.fraseLlavePrivada.trim(), saltArray);

      const encryptedPrivKey = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivArray.buffer.slice(0) },
        aesKey,
        pkcs8
      );

      const encryptedBase64 = this.arrayBufferToBase64(encryptedPrivKey);
      const saltBase64 = this.arrayBufferToBase64(saltArray.buffer);
      const ivBase64 = this.arrayBufferToBase64(ivArray.buffer);
      this.clavePrivadaProtegida = `${saltBase64}:${ivBase64}:${encryptedBase64}`;

      this.estado = 'Par de claves generado y clave privada protegida correctamente';
    } catch (e) {
      this.estado = 'Error generando claves: ' + (e as Error).message;
    }
  }

  async cifrar() {
    try {
      if (!this.publicKeyCrypto) {
        this.estado = 'Primero debes generar las claves';
        return;
      }

      let datos: Uint8Array;
      if (this.archivo) {
        datos = new Uint8Array(await this.archivo.arrayBuffer());
      } else if (this.textoPlano.trim().length > 0) {
        datos = this.textEncoder.encode(this.textoPlano);
      } else {
        this.estado = 'No hay archivo ni texto para cifrar';
        return;
      }

      const chunkSize = 446; // límites para RSA-OAEP 4096 bits SHA-256
      let encryptedChunks: string[] = [];

      for(let i = 0; i < datos.length; i += chunkSize) {
        const chunk = datos.slice(i, i + chunkSize);
        const encrypted = await window.crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          this.publicKeyCrypto,
          chunk
        );
        encryptedChunks.push(this.arrayBufferToBase64(encrypted));
      }

      this.resultadoCifrado = encryptedChunks.join(":");
      this.estado = 'Cifrado correctamente';

      if (this.archivo) {
        const blob = new Blob([this.resultadoCifrado], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.archivo.name + '.enc';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      this.estado = 'Error al cifrar: ' + (e as Error).message;
    }
  }

  async descifrar() {
    try {
      if (!this.resultadoCifrado) {
        this.estado = 'No hay datos cifrados para descifrar';
        return;
      }
      if (!this.fraseLlavePrivada || this.fraseLlavePrivada.trim() === '') {
        this.estado = 'Debes ingresar la frase para desbloquear la clave privada';
        return;
      }
      if (!this.clavePrivadaProtegida) {
        this.estado = 'No hay clave privada protegida para desbloquear';
        return;
      }

      const parts = this.clavePrivadaProtegida.split(":");
      if (parts.length !== 3) {
        this.estado = 'Formato de clave privada protegida inválido';
        return;
      }

      const salt = new Uint8Array(this.base64ToArrayBuffer(parts[0]));
      const iv = new Uint8Array(this.base64ToArrayBuffer(parts[1]));
      const encryptedPrivKey = this.base64ToArrayBuffer(parts[2]);

      const aesKey = await this.deriveAESKey(this.fraseLlavePrivada.trim(), salt);

      const pkcs8 = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv.buffer.slice(0) },
        aesKey,
        encryptedPrivKey
      );

      this.privateKeyCrypto = await window.crypto.subtle.importKey(
        "pkcs8",
        pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      const encryptedChunksBase64 = this.resultadoCifrado.split(":");
      let decryptedBytes: number[] = [];

      for (const chunkBase64 of encryptedChunksBase64) {
        const encryptedChunk = this.base64ToArrayBuffer(chunkBase64);
        const decryptedChunk = await window.crypto.subtle.decrypt(
          { name: "RSA-OAEP" },
          this.privateKeyCrypto,
          encryptedChunk
        );
        const decryptedChunkArray = new Uint8Array(decryptedChunk);
        for (let b of decryptedChunkArray) {
          decryptedBytes.push(b);
        }
      }

      if (this.archivo) {
        const resultado = new Uint8Array(decryptedBytes);
        const blob = new Blob([resultado], { type: this.archivo.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.archivo.name.replace(/\.enc$/, '') || 'archivo_descifrado';
        a.click();
        URL.revokeObjectURL(url);
        this.resultadoCifrado = 'Archivo descifrado correctamente';
        this.clavePrivadaDescifrada = '';
      } else {
        const resultado = new Uint8Array(decryptedBytes);
        this.textoPlano = this.textDecoder.decode(resultado);
        this.clavePrivadaDescifrada = this.textoPlano;
      }

      this.estado = 'Descifrado correctamente';
    } catch (e) {
      this.estado = 'Contraseña incorrecta o datos dañados';
    }
  }
}
