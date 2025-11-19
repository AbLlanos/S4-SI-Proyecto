
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CifradoSimetrico } from './components/cifrado-simetrico/cifrado-simetrico';
import { CifradoAsimetrico } from './components/cifrado-asimetrico/cifrado-asimetrico';




export const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", component: Home },

    { path: "cifradoSimetrico", component: CifradoSimetrico },
    { path: "cifradoAsimetrico", component: CifradoAsimetrico },

];
