
const Home = {
    text: 'Home',
    link: '/home',  
    icon: 'icon-home'
};

const CerrarSesion = {
    text: 'Cerrar Sesión',
    link: '/login',
    icon: 'icon-logout'
};

const CargaReporte = {
    text: 'Carga Reporte',
    link: '/reporteD',
    icon: 'icon-speedometer',
    submenu: [
        {
            text: 'Semanal',
            link: '/carga/semanal'
        },
        {
            text: 'Diario',
            link: '/carga/diario'
        }          
    ]    
};

const Solicitud = {
    text: 'Solicitud',
    link: '/solicitud',
    icon: 'icon-speedometer',
    submenu: [
        {
            text: 'Lista',
            link: '/solicitud/lista'
        },
        {
            text: 'Reporte de Carga',
            link: '/solicitud/reporte'
        },
        {
            text: 'Reporte Diario',
            link: '/solicitud/reporte-diario'
        }          
    ]    
};
const Mantenimiento = {
    text: 'Mantenimiento',
    link: '/mantenimiento',
    icon: 'icon-speedometer',
    submenu: [
        {
            text: 'Asociacion de Usuario',
            link: '/mantenimiento/listausuario'
        }         
    ]    
};

const Administracion = {
    text: 'Administracion',
    link: '/administracion',
    icon: 'icon-speedometer',
    submenu: [
        {
            text: 'Areas',
            link: '/administracion/areas'
        },
        {
            text: 'Usuarios',
            link: '/administracion/usuarios'
        },
        {
            text: 'Perfiles',
            link: '/administracion/perfiles'
        }          
    ]    
};


export const menu = [

    //CargaReporte,
   // Solicitud,
    //Mantenimiento
    //CerrarSesion
    Administracion
];
