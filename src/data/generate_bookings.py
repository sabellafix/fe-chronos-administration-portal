#!/usr/bin/env python3
"""
Script para generar inserts SQL de Bookings y BookingService
para Septiembre, Octubre y Noviembre 2025
"""

import uuid
from datetime import datetime, timedelta, date, time
import random

# Datos base
CUSTOMERS = [
    ('4f8b7afc-ca83-4e19-a281-129d0b54fa2f', 'Carmen Jiménez'),
    ('811c4c9e-6845-40b0-bf33-428470f3ca14', 'Elena García'),
    ('b9a695a2-072b-4cbf-a20e-6d3f55ccc4ba', 'Lucía Fernández'),
    ('d89fb75a-a7e1-4b91-9ea8-7bf7308cdf1e', 'Fernando Herrera'),
    ('7ea812bc-bedd-41f0-a770-85aada876f36', 'Natalia Castro'),
    ('7a969d8e-83d5-450a-b357-9db2cfaa2eba', 'Miguel Torres'),
    ('28a89b3e-e6cb-4458-b3ab-b5be7b133c23', 'Ana López'),
    ('dbd39a8f-1eec-4cdd-8440-b7bfb5e3d77c', 'Patricia Ramos'),
    ('6f5b40cd-5f99-4687-ae8f-cb1b482151a8', 'Isabella Moreno'),
    ('9ddbb539-dd48-40fe-8ab4-e23f02b19d56', 'Roberto Vega'),
]

SUPPLIERS = [
    ('01EB400D-6C7A-4783-BCF1-3E71834D512B', 'Laura Peña'),
    ('1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Sergio Abella'),
    ('72C92B4A-6322-4823-BDE6-5C676458E0A6', 'Carlos Rodríguez'),
    ('787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Carol Smith'),
    ('26E31B62-2ACD-4EB9-8A3E-7A052AC28E6F', 'Paula Castillo'),
    ('3F437D11-1FEA-449D-A284-8A0B7FBBCA89', 'Sofía Martínez'),
    ('5AD247C1-6664-41C8-991E-C6639611ACB9', 'Elena García'),
    ('50A3453E-04F1-406D-8B80-E7B97477BCA0', 'Valeria Vallejo'),    
]

# Servicios (ServiceId, SupplierId, Nombre, Precio, Duración en minutos)
SERVICES = [
    ('17DC7923-830C-4DB6-AADD-1A95AFE10880', '5AD247C1-6664-41C8-991E-C6639611ACB9', 'Balayage Highlights', 120.00,	180),
    ('94CC1682-66EC-491F-8587-1B339D91E08D', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Relaxing Massage', 50.00,	60),
    ('D3D1DB2C-79EB-42AA-9918-24C126553E17', '787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Relaxing Massage', 50.00,	60),
    ('9F737F4D-E246-48F8-B8C8-410C0572F1B1', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Balayage Highlights', 120.00,	180),
    ('0133CD41-EE0B-43EA-A264-442159CD676C', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Gel Manicure', 46.00,	90),
    ('F9D3AB29-66DD-478D-B2D7-4A565232F4F5', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Men Modern Haircut', 25.00, 55),
    ('BE62B17C-4609-46FE-9C35-4C6E4FCCA4A3', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Relieving Massage', 80.00, 90),
    ('41808DAF-DC5F-4822-8514-52A44CCCDB81', '72C92B4A-6322-4823-BDE6-5C676458E0A6', 'Full Hair Color', 65.00, 120),
    ('08969BBA-8BC9-49AC-A1A9-562879C351B0', '787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Full Hair Color', 65.00, 120),
    ('8D7C500F-A377-495A-B3EA-646A6D21AB63', '72C92B4A-6322-4823-BDE6-5C676458E0A6', 'Deep Facial Cleansing', 45.00,90),
    ('92C014F5-BA93-4949-8DA9-657C3902877F', '5AD247C1-6664-41C8-991E-C6639611ACB9', 'Women Classic Haircut', 35.00,60),
    ('6778706F-A306-4C68-BEAE-74EA88B6AD9D', '26E31B62-2ACD-4EB9-8A3E-7A052AC28E6F', 'Chemical Peel', 80.00, 60),
    ('31E7EA47-90BE-49DC-BAAF-7F26FEDB183A', '787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Men Modern Haircut', 25.00, 45),
    ('7C9E0241-03FD-48B7-B5F4-8740ABA9A53B', '1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Chemical Peel', 120.00, 65),
    ('74ABF9D3-321E-45E6-9B37-8FAE97F63617', '787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Lash Lift & Curl', 67.00, 45),
    ('DEFC64CA-CAE7-460E-BAF2-9A552D203D5B', '787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Relieving Massage', 70.00, 90),
    ('48A78D90-27BC-42E1-BE4E-CA1FE2C42118', '26E31B62-2ACD-4EB9-8A3E-7A052AC28E6F', 'Relieving Massage', 70.00, 90),
    ('D62E6055-0B7B-4BE6-8A30-D4B43E1F4D67', '01EB400D-6C7A-4783-BCF1-3E71834D512B', 'Relaxing Massage', 65.00, 67),
    ('F4D04305-356C-4750-8738-D9CFBA7FEB9C', '3F437D11-1FEA-449D-A284-8A0B7FBBCA89', 'Spa Pedicure', 40.00, 90),
    ('4B4B4691-82AB-47CA-8B2A-DADB31E085D3', '01EB400D-6C7A-4783-BCF1-3E71834D512B', 'Gel Manicure', 35.00, 86),
    ('BF1A976F-E558-4DEC-B17B-E02F0AEF43A3', '3F437D11-1FEA-449D-A284-8A0B7FBBCA89', 'Deep Facial Cleansing', 45.00, 90),
    ('5F664DE8-F255-476B-A17F-E0E1CECD180C', '01EB400D-6C7A-4783-BCF1-3E71834D512B', 'Women Classic Haircut', 89.00, 45),
    ('9FAEC70A-12C1-4F63-8B7F-FA13013633AD', '50A3453E-04F1-406D-8B80-E7B97477BCA0', 'Relaxing Massage', 50.00, 60)
]
STATUSES = ['Confirmed', 'Pending', 'Confirmed', 'Confirmed', 'Pending', 'Confirmed', 'Pending', 'Cancelled']
PAYMENT_STATUSES = [0, 1, 0, 1, 0, 0, 1]

START_HOURS = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18]


def generate_booking_id(counter):
    """Genera un ID único para el booking usando UUID"""
    # Generar un GUID real a partir de un namespace y el counter
    # Usamos un namespace fijo + el counter para generar GUIDs reproducibles
    namespace = uuid.UUID('12345678-1234-5678-1234-567812345678')
    guid = uuid.uuid5(namespace, f'booking-{counter}')
    return str(guid).upper()


def calculate_end_time(start_time_obj, duration_minutes):
    """Calcula la hora de fin sumando la duración"""
    # Convertir time a datetime para hacer la suma
    dummy_date = datetime.combine(date.today(), start_time_obj)
    end_datetime = dummy_date + timedelta(minutes=duration_minutes)
    return end_datetime.time()


def generate_bookings_for_date(booking_date, booking_counter):
    """Genera 10 bookings para una fecha específica"""
    bookings = []
    booking_services = []
    
    for i in range(10):
        # Seleccionar datos aleatorios
        customer_id, customer_name = random.choice(CUSTOMERS)
        service_id, supplier_id, service_name, price, duration = random.choice(SERVICES)
        status = random.choice(STATUSES)
        payment_status = random.choice(PAYMENT_STATUSES)
        
        # Generar horarios
        start_hour = START_HOURS[i]
        start_time_obj = time(start_hour, random.choice([0, 15, 30, 45]))
        end_time_obj = calculate_end_time(start_time_obj, duration)
        
        # Fechas de creación
        created_at = booking_date - timedelta(days=random.randint(1, 10))
        created_at_str = created_at.strftime('%Y-%m-%dT%H:%M:%S.0000000')
        
        confirmed_at = 'NULL'
        if status == 'Confirmed':
            confirm_date = created_at + timedelta(hours=random.randint(1, 24))
            confirmed_at = f"CAST(N'{confirm_date.strftime('%Y-%m-%dT%H:%M:%S.0000000')}' AS DateTime2)"
        
        # Generar IDs
        booking_id = generate_booking_id(booking_counter)
        booking_reference = f"BK{booking_date.strftime('%Y%m%d')}{i+1:04d}"
        
        # Generar SQL de Booking
        booking_datetime = f"{booking_date.strftime('%Y-%m-%d')}T{start_time_obj.strftime('%H:%M:%S')}.0000000"
        
        booking_sql = f"""INSERT [Chronos].[Bookings] ([Id], [CustomerId], [SupplierId], [BookingDate], [StartTime], [EndTime], [DurationMinutes], [TotalPrice], [Currency], [Status], [ClientNotes], [ProviderNotes], [BookingReference], [CreatedAt], [UpdatedAt], [ConfirmedAt], [CompletedAt], [CancelledAt], [CancellationReason], [BookingDateTime], [PaymentStatus], [SalonId]) VALUES (N'{booking_id}', N'{customer_id}', N'{supplier_id}', CAST(N'{booking_date.strftime('%Y-%m-%d')}' AS Date), CAST(N'{start_time_obj.strftime('%H:%M:%S')}' AS Time), CAST(N'{end_time_obj.strftime('%H:%M:%S')}' AS Time), {duration}, CAST({price:.2f} AS Decimal(10, 2)), N'COP', N'{status}', NULL, NULL, N'{booking_reference}', CAST(N'{created_at_str}' AS DateTime2), CAST(N'{created_at_str}' AS DateTime2), {confirmed_at}, NULL, NULL, NULL, CAST(N'{booking_datetime}' AS DateTime2), {payment_status}, NULL)"""
        
        bookings.append(booking_sql)
        
        # Generar SQL de BookingService
        booking_service_sql = f"INSERT [Chronos].[BookingService] ([BookingId], [ServiceId], [Order]) VALUES (N'{booking_id}', N'{service_id}', 0)"
        
        # Ocasionalmente agregar un segundo servicio
        if random.random() < 0.3:  # 30% de probabilidad
            second_service = random.choice(SERVICES)
            if second_service[1] == supplier_id:  # Mismo proveedor
                booking_service_sql2 = f"INSERT [Chronos].[BookingService] ([BookingId], [ServiceId], [Order]) VALUES (N'{booking_id}', N'{second_service[0]}', 1)"
                booking_services.append(booking_service_sql2)
        
        booking_services.append(booking_service_sql)
        
        booking_counter += 1
    
    return bookings, booking_services, booking_counter


def main():
    """Función principal"""
    output_file = 'chronos-beauty-bookings-sept-oct-nov-2025-COMPLETE.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Encabezado
        f.write("""-- =============================================
-- INSERTS COMPLETOS PARA BOOKINGS Y BOOKINGSERVICE
-- SEPTIEMBRE, OCTUBRE Y NOVIEMBRE 2025
-- 10 bookings por día = 910 bookings totales
-- Generado automáticamente
-- =============================================

""")
        
        booking_counter = 1
        
        # Septiembre 2025
        f.write("-- =============================================\n")
        f.write("-- SEPTIEMBRE 2025\n")
        f.write("-- =============================================\n\n")
        
        start_date = date(2025, 9, 1)
        
        for day in range(30):  # Septiembre tiene 30 días
            current_date = start_date + timedelta(days=day)
            day_name = current_date.strftime('%A')
            
            f.write(f"-- {current_date.strftime('%Y-%m-%d')} ({day_name})\n")
            
            bookings, booking_services, booking_counter = generate_bookings_for_date(current_date, booking_counter)
            
            for booking in bookings:
                f.write(booking + "\n")
            
            f.write("\n-- BookingService para " + current_date.strftime('%Y-%m-%d') + "\n")
            for bs in booking_services:
                f.write(bs + "\n")
            
            f.write("GO\n\n")
        
        # Octubre 2025
        f.write("\n-- =============================================\n")
        f.write("-- OCTUBRE 2025\n")
        f.write("-- =============================================\n\n")
        
        start_date = date(2025, 10, 1)
        
        for day in range(31):  # Octubre tiene 31 días
            current_date = start_date + timedelta(days=day)
            day_name = current_date.strftime('%A')
            
            f.write(f"-- {current_date.strftime('%Y-%m-%d')} ({day_name})\n")
            
            bookings, booking_services, booking_counter = generate_bookings_for_date(current_date, booking_counter)
            
            for booking in bookings:
                f.write(booking + "\n")
            
            f.write("\n-- BookingService para " + current_date.strftime('%Y-%m-%d') + "\n")
            for bs in booking_services:
                f.write(bs + "\n")
            
            f.write("GO\n\n")
        
        # Noviembre 2025
        f.write("\n-- =============================================\n")
        f.write("-- NOVIEMBRE 2025\n")
        f.write("-- =============================================\n\n")
        
        start_date = date(2025, 11, 1)
        
        for day in range(30):  # Noviembre tiene 30 días
            current_date = start_date + timedelta(days=day)
            day_name = current_date.strftime('%A')
            
            f.write(f"-- {current_date.strftime('%Y-%m-%d')} ({day_name})\n")
            
            bookings, booking_services, booking_counter = generate_bookings_for_date(current_date, booking_counter)
            
            for booking in bookings:
                f.write(booking + "\n")
            
            f.write("\n-- BookingService para " + current_date.strftime('%Y-%m-%d') + "\n")
            for bs in booking_services:
                f.write(bs + "\n")
            
            f.write("GO\n\n")
        
        f.write("\n-- =============================================\n")
        f.write(f"-- TOTAL DE BOOKINGS GENERADOS: {booking_counter - 1}\n")
        f.write("-- =============================================\n")
    
    print(f"✓ Archivo generado exitosamente: {output_file}")
    print(f"✓ Total de bookings generados: {booking_counter - 1}")
    print(f"✓ Rango de fechas: 2025-09-01 a 2025-11-30")


if __name__ == '__main__':
    main()

