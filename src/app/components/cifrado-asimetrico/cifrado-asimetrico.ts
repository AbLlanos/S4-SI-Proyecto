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
  passphrase: string = '';
  estadoArchivoCifrado: string = '';
  archivoCifradoParaDescifrar: File | null = null;
  clavePrivadaParaDescifrar: string = '';
  passphraseParaDescifrado: string = '';


  constructor() { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files && input.files.length > 0 ? input.files[0] : null;
    this.estado = this.archivo ? `Archivo seleccionado: ${this.archivo.name}` : '';
    this.resultadoCifrado = '';
    console.log('Archivo seleccionado:', this.archivo);
  }

  async generarClavesOpenPGP() {
    try {
      const passphrase = prompt('Ingrese una passphrase para proteger la clave privada:');
      if (!passphrase) {
        this.estado = "Generación de claves cancelada: se requiere una passphrase.";
        return;
      }
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: "Usuario Angular", email: "test@example.com" }],
        passphrase // Aquí se cifra la clave privada con esa passphrase
      });
      this.clavePublicaPEM = publicKey;
      this.clavePrivadaPEM = privateKey;
      this.estado = "Claves PGP generadas correctamente y protegidas con passphrase.";
      console.log('Claves generadas:', { publicKey, privateKey });
    } catch (error) {
      console.error('Error generando claves:', error);
      this.estado = "Error generando las claves.";
    }
  }




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
      console.log('Clave pública para cifrado:', publicKey);

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ binary: new Uint8Array(fileBuffer) }),
        encryptionKeys: publicKey,
        format: "binary"
      });
      console.log('Archivo cifrado con éxito.');

      const blob = new Blob([encrypted], { type: "application/pgp-encrypted" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.archivo.name + ".pgp";
      link.click();
      window.URL.revokeObjectURL(url);

      this.estado = "Archivo cifrado";
    } catch (error) {
      console.error('Error al cifrar archivo:', error);
      this.estado = "Error al cifrar el archivo.";
    }
  }

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
      console.log('Clave privada para descifrado:', privateKey);

      const encryptedBytes = new Uint8Array(await this.archivo.arrayBuffer());
      const message = await openpgp.readMessage({ binaryMessage: encryptedBytes });
      console.log('Archivo para descifrado leído correctamente.');

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
        format: "binary"
      });
      console.log('Archivo descifrado con éxito.');

      const blob = new Blob([decrypted], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = this.archivo.name.replace(/\.pgp$/i, "");
      link.click();
      window.URL.revokeObjectURL(url);

      this.estado = "Archivo descifrado correctamente.";
    } catch (error) {
      console.error('Error al descifrar archivo:', error);
      this.estado = "Error al descifrar. Verifique la clave privada.";
    }
  }
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
      console.log('Clave pública para cifrado de texto:', publicKey);

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: this.textoPlano }),
        encryptionKeys: publicKey
      });
      console.log('Texto cifrado correctamente.');

      this.resultadoCifrado = encrypted;
      this.estado = "Texto cifrado correctamente (PGP ASCII).";

      // Descargar automáticamente el texto cifrado como archivo .txt
      const blob = new Blob([encrypted], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "texto_cifrado.txt";
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al cifrar texto:', error);
      this.estado = "Error al cifrar texto.";
    }
  }
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
      if (!this.passphraseParaDescifrado) {
        this.estado = "Ingrese la passphrase para desbloquear la clave privada.";
        return;
      }

      const privateKey = await openpgp.readPrivateKey({ armoredKey: this.clavePrivadaPEM });
      const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey,
        passphrase: this.passphraseParaDescifrado
      });
      console.log('Clave privada desbloqueada.');

      const message = await openpgp.readMessage({ armoredMessage: this.resultadoCifrado });
      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: decryptedPrivateKey
      });

      console.log('Texto descifrado correctamente.');
      this.textoPlano = decrypted;
      this.estado = "Texto descifrado correctamente.";

      // Descargar automáticamente el texto descifrado como archivo .txt
      const blob = new Blob([decrypted], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "texto_descifrado.txt";
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al descifrar texto:', error);
      this.estado = "Error al descifrar el texto.";
    }
  }




  descargarClavePrivada() {
    if (!this.clavePrivadaPEM) return;
    const blob = new Blob([this.clavePrivadaPEM], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "clave_privada.asc";
    link.click();
    window.URL.revokeObjectURL(url);
    console.log('Clave privada descargada.');
  }

  descargarClavePublica() {
    if (!this.clavePublicaPEM) return;
    const blob = new Blob([this.clavePublicaPEM], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "clave_publica.asc";
    link.click();
    window.URL.revokeObjectURL(url);
    console.log('Clave pública descargada.');
  }

  async cargarClavePrivada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clavePrivadaPEM = await input.files[0].text();
      console.log('Clave privada cargada:', this.clavePrivadaPEM);
      this.estado = "Clave privada cargada.";
    } else {
      this.estado = "No se seleccionó archivo.";
    }
  }

  async cargarClavePublica(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clavePublicaPEM = await input.files[0].text();
      try {
        const publicKey = await openpgp.readKey({ armoredKey: this.clavePublicaPEM });
        console.log('Clave pública cargada y leída correctamente:', publicKey);
        this.estado = "Clave pública cargada.";
      } catch (error) {
        console.error('Error leyendo la clave pública:', error);
        this.estado = "Error al leer la clave pública, revise el formato.";
      }
    } else {
      this.estado = "No se seleccionó archivo.";
    }
  }

  onArchivoCifradoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivoCifradoParaDescifrar = input.files && input.files.length > 0 ? input.files[0] : null;
    this.estadoArchivoCifrado = this.archivoCifradoParaDescifrar ? `Archivo cifrado seleccionado: ${this.archivoCifradoParaDescifrar.name}` : 'No se seleccionó archivo cifrado.';
    console.log(this.estadoArchivoCifrado);
  }

  async onClavePrivadaParaDescifrar(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clavePrivadaParaDescifrar = await input.files[0].text();
      this.estadoArchivoCifrado = "Clave privada cargada para descifrado.";
      console.log(this.estadoArchivoCifrado, this.clavePrivadaParaDescifrar);
    } else {
      this.estadoArchivoCifrado = "No se seleccionó archivo de clave privada.";
      console.log(this.estadoArchivoCifrado);
    }
  }

  async descifrarArchivoConClavePrivada() {
    try {
      if (!this.archivoCifradoParaDescifrar) {
        this.estadoArchivoCifrado = "Seleccione un archivo cifrado primero.";
        return;
      }
      if (!this.clavePrivadaParaDescifrar) {
        this.estadoArchivoCifrado = "Cargue una clave privada para descifrar.";
        return;
      }

      // Lee la clave privada armorizada
      const privateKey = await openpgp.readPrivateKey({ armoredKey: this.clavePrivadaParaDescifrar });

      // Aquí debes pedir la passphrase para desbloquearla (puedes implementarlo como prompt o un input)
      const passphrase = prompt('Ingrese la passphrase de la clave privada:');

      if (!passphrase) {
        this.estadoArchivoCifrado = "Se requiere la passphrase para desbloquear la clave privada.";
        return;
      }

      // Desbloquea (desencripta) la clave privada usando la passphrase
      const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey,
        passphrase
      });

      // Continúa con el descifrado del archivo
      const encryptedBytes = new Uint8Array(await this.archivoCifradoParaDescifrar.arrayBuffer());
      const message = await openpgp.readMessage({ binaryMessage: encryptedBytes });

      const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: decryptedPrivateKey,
        format: "binary"
      });

      const blob = new Blob([decrypted], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = this.archivoCifradoParaDescifrar.name.replace(/\.pgp$/i, "");
      link.click();
      window.URL.revokeObjectURL(url);

      this.estadoArchivoCifrado = "Archivo descifrado correctamente.";
    } catch (error) {
      console.error('Error al descifrar archivo con clave privada:', error);
      this.estadoArchivoCifrado = "Error al descifrar el archivo. Verifique la clave privada y la passphrase.";
    }
  }

  get textoMostrar(): string {
    return this.resultadoCifrado || this.textoPlano || '';
  }
}
