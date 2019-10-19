# RedMedic

RedMedic es un sistema de gestión de datos médicos multiinstitucional basado en la tecnología Blockchain. Este repositorio está dedicado al desarrollo de la app de escritorio para que los pacientes puedan interactuar con la plataforma y gestionar sus datos.

Tengo también una web dedicada a explicar un poco como va el proyecto y la puedes encontrar o bien visitando redmedic.net o la pagina web hosteada directamente a traves de github redmedic.github.io.

![Screen Shot](https://github.com/OscarBalcells/app-redmedic/blob/master/assets/screenshot.png)

# Partes de la App

A continuacion voy a ir en detalle explicando las 4 pestañas distintas con las que cuenta la aplicación.

- Tu historia médica
- Regulación de permisos
- Pestaña de búsqueda
- Gestión de perfiles

## Tu Historia Médica

![Screen Shot](https://github.com/OscarBalcells/app-redmedic/blob/master/assets/history.png)

En esta pestaña puedes visualizar todos tus datos de forma rápida ya que están ordenados según la fecha y los campos y la información importante está además marcada para que puedas encontrarla más rápidamente como por ejemplo el estatus de una condición asociada.

Para ver un recurso en detalle solo hace falta expandirlo a través de la flechita de la izquierda. Puedes seleccionar también una única categoría para ver solo los recursos que pertenezcan ahi.

## Permisos

![Screen Shot](https://github.com/OscarBalcells/app-redmedic/blob/master/assets/permissions.png)

Esta otra pestaña está diseñada para que puedas regular los accesos a tu datos. En cada recuadro encuentras todos los permisos asociados a una relación entre ti y un proveedor de salud, como por ejemplo la consulta de tu médico de cabecera.

Los permisos funcionan a través de direcciones en el Blockchain. Es decir, que si quieres que una persona X pueda ver tu listado de alergias que hay almacenado en la consulta de tu médico, esta persona tiene que disponer de una wallet en Ethereum, asociada a una dirección. La API de la base de datos de tu consulta no sabe quien está intentando acceder, tan solo sabe, a través de la firma criptográfica, que dirección es.

## Búsqueda

![Screen Shot](https://github.com/OscarBalcells/app-redmedic/blob/master/assets/search.png)

Este apartado te permite acceder a recursos concretos localizados en una IP conocida del ID que tu elijas. Si tu dirección no tiene acceso a esa categoría específica, se denegará tu petición de acceso a los datos.

## Gestión de perfiles

![Screen Shot](https://github.com/OscarBalcells/app-redmedic/blob/master/assets/profiles.png)

Aquí podrás gestionar todos los perfiles. Puedes crear nuevas identidades en la red de RedMedic, borrar otras de tu ordenador (seguirán existiendo en RedMedic), cambiar detalles de tu perfil para poder identificarlo y activar el que quieras usar en el momento. El perfil activado se puede observar abajo a la izquierda en el recuadrito para que puedas saber cual estás usando.

## Instalación

De momento, no hay ningún ejecutable de la aplicación. Tan solo se puede utilizar a través de la consola.
Para poder utilizar la app necesitas tener nodejs en tu ordenador y en caso de que quieras jugar con datos reales,
necesitarás un contenedor que representa las APIs "falsas" de los proveedores de salud.

[Para más información sobre las APIs](https://github.com/OscarBalcells/apis-redmedic).

```
git clone https://github.com/oscarblcells/app-redmedic.git
cd app-redmedic
npm install
npm start
```
