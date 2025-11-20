import { Component } from '@angular/core';
import { NavBar } from "../general/nav-bar/nav-bar";
import { Footer } from "../general/footer/footer";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as openpgp from 'openpgp';

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

  clavePublicaPEM: string = '';
  clavePrivadaPEM: string = '';

  constructor() {}

  // Selección de archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files && input.files.length > 0 ? input.files[0] : null;
    this.estado = this.archivo ? `Archivo seleccionado: ${this.archivo.name}` : '';
    this.resultadoCifrado = '';
  }

  // GENERAR PAR DE CLAVES COMPATIBLES CON KLEOPATRA
  async generarClavesOpenPGP() {
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: "Usuario Angular", email: "test@example.com" }]
      });
      this.clavePublicaPEM = publicKey;
      this.clavePrivadaPEM = privateKey;
      this.estado = "Claves PGP generadas correctamente (compatibles con Kleopatra).";
    } catch (error) {
      console.error(error);
      this.estado = "Error generando las claves.";
    }
  }

  // CIFRAR ARCHIVO (compatible Kleopatra)
  async cifrarArchivo() {
    try {
      if (!this.archivo) {
        this.estado = "Seleccione un archivo primero.";
        return;
      }
      if (!this.clavePublicaPEM) {
        this.estado = "Genere o cargue una clave pública primero.";
        return;
      }
      const fileBuffer = await this.archivo.arrayBuffer();
      const publicKey = await openpgp.readKey({ armoredKey: this.clavePublicaPEM });

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ binary: new Uint8Array(fileBuffer) }),
        encryptionKeys: publicKey,
        format: "binary"
      });

      const blob = new Blob([encrypted], { type: "application/pgp-encrypted" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.archivo.name + ".pgp";
      link.click();
      window.URL.revokeObjectURL(url);

      this.estado = "Archivo cifrado (formato .pgp compatible con Kleopatra).";
    } catch (error) {
      console.error(error);
      this.estado = "Error al cifrar el archivo.";
    }
  }

  // DESCIFRAR ARCHIVO (compatible Kleopatra)
  async descifrarArchivo() {
    try {
      if (!this.archivo) {
        this.estado = "Seleccione un archivo .pgp para descifrar.";
        return;
      }
      if (!this.clavePrivadaPEM) {
        this.estado = "Genere o cargue una clave privada primero.";
        return;
      }
      const privateKey = await openpgp.readPrivateKey({ armoredKey: this.clavePrivadaPEM });
      const encryptedBytes = new Uint8Array(await this.archivo.arrayBuffer());
      const message = await openpgp.readMessage({ binaryMessage: encryptedBytes });

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
        format: "binary"
      });

      const blob = new Blob([decrypted], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = this.archivo.name.replace(/\.pgp$/i, "");
      link.click();
      window.URL.revokeObjectURL(url);

      this.estado = "Archivo descifrado correctamente.";
    } catch (error) {
      console.error(error);
      this.estado = "Error al descifrar. Verifique la clave privada.";
    }
  }

  // CIFRAR TEXTO (OpenPGP ASCII)
  async cifrarTexto() {
    try {
      if (!this.textoPlano.trim()) {
        this.estado = "Ingrese un texto.";
        return;
      }
      if (!this.clavePublicaPEM) {
        this.estado = "Genere o cargue una clave pública primero.";
        return;
      }
      const publicKey = await openpgp.readKey({ armoredKey: this.clavePublicaPEM });

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: this.textoPlano }),
        encryptionKeys: publicKey
      });

      this.resultadoCifrado = encrypted;
      this.estado = "Texto cifrado correctamente (PGP ASCII).";
    } catch (error) {
      console.error(error);
      this.estado = "Error al cifrar texto.";
    }
  }

  // DESCIFRAR TEXTO (OpenPGP ASCII)
  async descifrarTexto() {
    try {
      if (!this.resultadoCifrado.trim()) {
        this.estado = "Ingrese o cargue texto cifrado.";
        return;
      }
      if (!this.clavePrivadaPEM) {
        this.estado = "Genere o cargue una clave privada primero.";
        return;
      }
      const privateKey = await openpgp.readPrivateKey({ armoredKey: this.clavePrivadaPEM });
      const message = await openpgp.readMessage({ armoredMessage: this.resultadoCifrado });

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey
      });

      this.textoPlano = decrypted;
      this.estado = "Texto descifrado correctamente.";
    } catch (error) {
      console.error(error);
      this.estado = "Error al descifrar el texto.";
    }
  }

  // DESCARGAR CLAVE PRIVADA
  descargarClavePrivada() {
    if (!this.clavePrivadaPEM) return;
    const blob = new Blob([this.clavePrivadaPEM], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "clave_privada.asc";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // DESCARGAR CLAVE PUBLICA
  descargarClavePublica() {
    if (!this.clavePublicaPEM) return;
    const blob = new Blob([this.clavePublicaPEM], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "clave_publica.asc";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // CARGAR CLAVE PRIVADA
  async cargarClavePrivada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clavePrivadaPEM = await input.files[0].text();
      this.estado = "Clave privada cargada.";
    } else {
      this.estado = "No se seleccionó archivo.";
    }
  }

  // CARGAR CLAVE PUBLICA
  async cargarClavePublica(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clavePublicaPEM = await input.files[0].text();
      this.estado = "Clave pública cargada.";
    } else {
      this.estado = "No se seleccionó archivo.";
    }
  }
}
