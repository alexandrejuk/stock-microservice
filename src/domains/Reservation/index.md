# Reservation

Reservation must have the following data:
* description: reservation description,
* reservedAt: reservation date,
* releasedAt: it conveys the date the reservation was delivered,
* tecnicoId: it may have the tecnico id,
* originId: it can be a atendimento id for example,
* originType: from where it is coming from,
* status: the current status of the reservation = reservado, liberado
* items: the item relared to the reservation

## Reservation Items
It must have the following data:
* productId: the productId related to that reservation
* quantity: the quantity that is being reserved
* currentQuantity: indicates the current quantity that can be released or returned to stock =)