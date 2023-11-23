import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { MenuService } from './core/_service/menu.service';
import { menu } from './pages/_menu';
import { GuardServiceGuard } from './core/_service/guard/guard-service.guard';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'administracion/areas',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./pages/home/home.module').then((m) => m.HomeModule),
        canActivate: [GuardServiceGuard],
      },
      {
        path: 'administracion',
        loadChildren: () =>
          import('./pages/administracion/administracion.module').then(
            (m) => m.AdministracionModule
          ),
        canActivate: [GuardServiceGuard],
      },
      {
        path: 'info',
        loadChildren: () =>
          import('./pages/info/info.module').then((m) => m.InfoModule),
        canActivate: [GuardServiceGuard],
      },
      {
        path: "prog", loadChildren: () => import('./pages/prog/programacion.module').then(m => m.ProgramacionModule),canActivate: [GuardServiceGuard]
      },
    ]
  },
  {
    path: 'seg',
    loadChildren: () =>
      import('./pages/seguridad/seguridad.module').then(
        (m) => m.SeguridadModule
      ),
  },
  { path: '**', redirectTo: 'not-404', pathMatch: 'full' },
  { path: '', redirectTo: 'seg/login', pathMatch: 'full' },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(public menuService: MenuService) {
    menuService.addMenu(menu);
  }
}
