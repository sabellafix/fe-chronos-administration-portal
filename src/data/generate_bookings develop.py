#!/usr/bin/env python3
"""
Script para generar inserts SQL de Bookings y BookingService
para los años 2024 y 2025 completos (todos los meses)
"""

import uuid
from datetime import datetime, timedelta, date, time
import random


# Datos base
SALONS = [
    ('07C3FEA6-9326-45CF-B97B-C29B92E5437E', 'Chronos Nort Point'),
    ('790ECEAA-2D87-4B8A-9594-F21D82F0799F', 'Chronos Central Park')
]

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


# Suppliers (SupplierId, Nombre, IdSalon)
SUPPLIERS = [
    ('01EB400D-6C7A-4783-BCF1-3E71834D512B', 'Laura Peña', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('1121AAE0-83FA-4282-BD33-3EC76732CA5B', 'Sergio Abella', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('72C92B4A-6322-4823-BDE6-5C676458E0A6', 'Carlos Rodríguez', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('787DAC6E-EAFB-44C9-9335-75E21C5A3EB0', 'Carol Smith', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('26E31B62-2ACD-4EB9-8A3E-7A052AC28E6F', 'Paula Castillo', '07C3FEA6-9326-45CF-B97B-C29B92E5437E'),
    ('3F437D11-1FEA-449D-A284-8A0B7FBBCA89', 'Sofía Martínez', '07C3FEA6-9326-45CF-B97B-C29B92E5437E'),
    ('5AD247C1-6664-41C8-991E-C6639611ACB9', 'Elena García', '07C3FEA6-9326-45CF-B97B-C29B92E5437E'),
    ('50A3453E-04F1-406D-8B80-E7B97477BCA0', 'Valeria Vallejo', '07C3FEA6-9326-45CF-B97B-C29B92E5437E'),    
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
# Estados válidos según el enum BookingStatus
STATUSES_FUTURE = ['Pending', 'Confirmed', 'Confirmed', 'Confirmed', 'InBasket']
STATUSES_PAST = ['Completed', 'Completed', 'Completed', 'Completed', 'Cancelled', 'NoShow']

PAYMENT_STATUSES = [0, 1, 0, 1, 0, 0, 1]

# Horarios de operación del salón (7 AM a 8 PM)
OPERATING_HOURS = list(range(7, 21))  # 7, 8, 9, ..., 20

# Fecha de corte para determinar si un booking está en el pasado o futuro
# Los bookings antes del 4 de noviembre de 2025 están en estado Completed
CUTOFF_DATE = date(2025, 11, 4)

# Número de bookings por día
BOOKINGS_PER_DAY = 15


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


def get_salon_id_for_supplier(supplier_id):
    """Obtiene el SalonId para un supplier dado"""
    for sup_id, sup_name, salon_id in SUPPLIERS:
        if sup_id == supplier_id:
            return salon_id
    return None


def generate_bookings_for_date(booking_date, booking_counter):
    """Genera 15 bookings para una fecha específica, permitiendo múltiples suppliers a la misma hora"""
    bookings = []
    booking_services = []
    
    # Crear un pool de horarios con repeticiones para permitir múltiples bookings a la misma hora
    time_slots = []
    for _ in range(BOOKINGS_PER_DAY):
        hour = random.choice(OPERATING_HOURS)
        minute = random.choice([0, 15, 30, 45])
        time_slots.append((hour, minute))
    
    for i in range(BOOKINGS_PER_DAY):
        # Seleccionar datos aleatorios
        customer_id, customer_name = random.choice(CUSTOMERS)
        service_id, supplier_id, service_name, price, duration = random.choice(SERVICES)
        
        # Determinar status y payment_status basado en la fecha
        if booking_date < CUTOFF_DATE:
            # Bookings pasados: mayormente Completed, algunos Cancelled/NoShow
            status = random.choice(STATUSES_PAST)
            # Los bookings completados están pagados (1), los cancelados/NoShow pueden no estarlo
            payment_status = 1 if status == 'Completed' else random.choice([0, 1])
        else:
            # Bookings futuros: Pending, Confirmed, InBasket
            status = random.choice(STATUSES_FUTURE)
            payment_status = random.choice(PAYMENT_STATUSES)
        
        # Generar horarios usando los slots pre-generados
        start_hour, start_minute = time_slots[i]
        start_time_obj = time(start_hour, start_minute)
        end_time_obj = calculate_end_time(start_time_obj, duration)
        
        # Fechas de creación
        created_at = booking_date - timedelta(days=random.randint(1, 10))
        created_at_str = created_at.strftime('%Y-%m-%dT%H:%M:%S.0000000')
        
        # Configurar confirmed_at según el estado
        confirmed_at = 'NULL'
        if status in ['Confirmed', 'Completed', 'InProgress']:
            confirm_date = created_at + timedelta(hours=random.randint(1, 24))
            confirmed_at = f"CAST(N'{confirm_date.strftime('%Y-%m-%dT%H:%M:%S.0000000')}' AS DateTime2)"
        
        # Configurar completed_at para bookings completados
        completed_at = 'NULL'
        if status == 'Completed':
            # Completado después de la fecha del booking
            completed_date = datetime.combine(booking_date, end_time_obj) + timedelta(minutes=random.randint(5, 30))
            completed_at = f"CAST(N'{completed_date.strftime('%Y-%m-%dT%H:%M:%S.0000000')}' AS DateTime2)"
        
        # Configurar cancelled_at y cancellation_reason para bookings cancelados
        cancelled_at = 'NULL'
        cancellation_reason = 'NULL'
        if status in ['Cancelled', 'NoShow']:
            # Cancelado antes de la fecha del booking
            cancelled_date = booking_date - timedelta(days=random.randint(0, 5), hours=random.randint(1, 12))
            cancelled_at = f"CAST(N'{cancelled_date.strftime('%Y-%m-%dT%H:%M:%S.0000000')}' AS DateTime2)"
            if status == 'Cancelled':
                reasons = ['Cliente canceló', 'Cambio de planes', 'Emergencia personal', 'Reagendado']
                cancellation_reason = f"N'{random.choice(reasons)}'"
            else:
                cancellation_reason = f"N'Cliente no se presentó'"
        
        # Generar IDs
        booking_id = generate_booking_id(booking_counter)
        booking_reference = f"BK{booking_date.strftime('%Y%m%d')}{i+1:04d}"
        
        # Obtener el SalonId del supplier
        salon_id = get_salon_id_for_supplier(supplier_id)
        salon_id_value = f"N'{salon_id}'" if salon_id else "NULL"
        
        # Generar SQL de Booking
        booking_datetime = f"{booking_date.strftime('%Y-%m-%d')}T{start_time_obj.strftime('%H:%M:%S')}.0000000"
        
        booking_sql = f"""INSERT [Chronos].[Bookings] ([Id], [CustomerId], [SupplierId], [BookingDate], [StartTime], [EndTime], [DurationMinutes], [TotalPrice], [Currency], [Status], [ClientNotes], [ProviderNotes], [BookingReference], [CreatedAt], [UpdatedAt], [ConfirmedAt], [CompletedAt], [CancelledAt], [CancellationReason], [BookingDateTime], [PaymentStatus], [SalonId]) VALUES (N'{booking_id}', N'{customer_id}', N'{supplier_id}', CAST(N'{booking_date.strftime('%Y-%m-%d')}' AS Date), CAST(N'{start_time_obj.strftime('%H:%M:%S')}' AS Time), CAST(N'{end_time_obj.strftime('%H:%M:%S')}' AS Time), {duration}, CAST({price:.2f} AS Decimal(10, 2)), N'COP', N'{status}', NULL, NULL, N'{booking_reference}', CAST(N'{created_at_str}' AS DateTime2), CAST(N'{created_at_str}' AS DateTime2), {confirmed_at}, {completed_at}, {cancelled_at}, {cancellation_reason}, CAST(N'{booking_datetime}' AS DateTime2), {payment_status}, {salon_id_value})"""
        
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


def get_days_in_month(year, month):
    """Obtiene la cantidad de días de un mes específico"""
    days_per_month = {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    }
    # Verificar año bisiesto para febrero
    if month == 2 and ((year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)):
        return 29
    return days_per_month[month]


def get_month_name(month):
    """Obtiene el nombre del mes en español"""
    month_names = {
        1: 'ENERO', 2: 'FEBRERO', 3: 'MARZO', 4: 'ABRIL',
        5: 'MAYO', 6: 'JUNIO', 7: 'JULIO', 8: 'AGOSTO',
        9: 'SEPTIEMBRE', 10: 'OCTUBRE', 11: 'NOVIEMBRE', 12: 'DICIEMBRE'
    }
    return month_names[month]


def main():
    """Función principal"""
    output_file = 'chronos-beauty-bookings-2024-2025-COMPLETE.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Encabezado
        f.write("""-- =============================================
-- INSERTS COMPLETOS PARA BOOKINGS Y BOOKINGSERVICE
-- AÑO 2024 Y 2025 COMPLETOS
-- 15 bookings por día (múltiples suppliers pueden tener citas a la misma hora)
-- Generado automáticamente
-- =============================================

""")
        
        booking_counter = 1
        
        # Generar para 2024 y 2025
        for year in [2024, 2025]:
            f.write(f"\n-- =============================================\n")
            f.write(f"-- AÑO {year}\n")
            f.write(f"-- =============================================\n\n")
            
            # Generar para todos los meses del año
            for month in range(1, 13):
                month_name = get_month_name(month)
                days_in_month = get_days_in_month(year, month)
                
                f.write(f"-- =============================================\n")
                f.write(f"-- {month_name} {year}\n")
                f.write(f"-- =============================================\n\n")
                
                start_date = date(year, month, 1)
                
                for day in range(days_in_month):
                    current_date = start_date + timedelta(days=day)
                    day_name = current_date.strftime('%A')
                    
                    f.write(f"-- {current_date.strftime('%Y-%m-%d')} ({day_name})\n")
                    
                    bookings, booking_services, booking_counter = generate_bookings_for_date(current_date, booking_counter)
                    
                    for booking in bookings:
                        f.write(booking + "\n")
                    
                    f.write(f"\n-- BookingService para {current_date.strftime('%Y-%m-%d')}\n")
                    for bs in booking_services:
                        f.write(bs + "\n")
                    
                    f.write("GO\n\n")
        
        f.write("\n-- =============================================\n")
        f.write(f"-- TOTAL DE BOOKINGS GENERADOS: {booking_counter - 1}\n")
        f.write("-- =============================================\n")
    
    print(f"✓ Archivo generado exitosamente: {output_file}")
    print(f"✓ Total de bookings generados: {booking_counter - 1}")
    print(f"✓ Rango de fechas: 2024-01-01 a 2025-12-31")


if __name__ == '__main__':
    main()

