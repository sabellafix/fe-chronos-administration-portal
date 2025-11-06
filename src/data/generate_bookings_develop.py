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
    ('9AF7B1C3-2A46-4F37-9E5B-0AEBAB415BC5', 'Jared Volkers'),
    ('F1DFCDCA-5485-43AB-8BD8-15C1634FCBFA', 'Cheryl Mason'),
    ('F05DAD89-3794-44EB-A05C-19A3F293667E', 'Alida Patricia'),
    ('7B4DB3DD-6F0F-4E2C-B4F5-1C89E3CBB0D7', 'Jay Harig'),
    ('40E73D66-9C45-415D-A860-229418DA2F67', 'Test Testy'),
    ('FCF04AEC-797C-44F4-B4A9-318588098041', 'Brian Dawson'),
    ('9AB78120-BF96-49E3-B647-3B016E26B77D', 'Bob Palacios'),
    ('41AD7918-B777-45DE-A413-51B0C8ACC462', 'Mason Dawson'),
    ('2FACF6E8-CE77-486F-9395-53474443DD1B', 'Juan Sebastian Cortes Palacios'),
    ('97A78D1F-4CFA-4534-A92C-59827BFFABFF', 'Juan José Chronos'),
    ('485BB55D-2E8F-4CBF-A8AB-6AE99A17BC16', 'Test Testy'),
    ('B8F96A55-AC56-403C-99AA-723326818F20', 'Bob Palacios'),
    ('E0E747BE-82FD-4D0C-9772-7E17043F09B9', 'Frederich Nietzsche'),
    ('74E142A2-A3B6-4DF6-B143-7EC77011D72A', 'Laura Rodrigues'),
    ('DC3C15D9-F8C1-49C7-9E12-8F8E9A384829', 'James Chen'),
    ('51BE7833-1791-4492-91D1-99538AC7413E', 'Juan Sebastian Cortes'),
    ('2B8799A8-D3F8-453C-9638-998D44EECDC4', 'Reina Linda'),
    ('85FF7624-F14A-4D0D-8081-99E4B9B8B087', 'Bob Palacios'),
    ('84FA0872-4401-4CBA-A342-9AABC4D3F56C', 'Juan Look'),
    ('204C1FC0-C077-4518-8B84-A8B8B488FC7A', 'Ana Gomez'),
    ('75A660BE-F451-4F4C-A988-AF707AA5BFBD', 'Sergio Abella'),
    ('0D2103E3-6AB8-4BFB-8618-D57110FBFECB', 'Maria Rodriguez'),
    ('E2D491ED-C20A-4E20-9087-F34BD7562E9B', 'Andres Castro')
]


# Suppliers (SupplierId, Nombre, IdSalon)
SUPPLIERS = [
    ('22CB440A-DBAA-43CA-BD9E-39DAE3F63720', 'Matthew Beckner', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Sergio Ernesto Abella', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('E15689FB-DBAC-4556-A172-899F013474C8', 'Juan Sebastian Cortes', '790ECEAA-2D87-4B8A-9594-F21D82F0799F'),
    ('2C866524-527E-4174-ADB7-CC6A158EE7EC', 'Becca Dawson', '07C3FEA6-9326-45CF-B97B-C29B92E5437E'),
    ('4CE26E32-C9CE-4499-972B-FA8F32257728', 'Juan Sebastian Cortes', '07C3FEA6-9326-45CF-B97B-C29B92E5437E')
]

# Servicios (ServiceId, SupplierId, Nombre, Precio, Duración en minutos)
SERVICES = [
    ('4F8EE1A3-E19C-4331-88A1-02EAA4064FA8', '22CB440A-DBAA-43CA-BD9E-39DAE3F63720', 'Hair color',	50.00,	30),
    ('5A33CFCA-582B-4BF9-87D4-13E158BC0414', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Halloween makeup',	60.00,	50),
    ('E03392EC-A0FB-40AD-90C1-1FEE321C6498', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Long hair haircut',	20.00,	45),
    ('E1C3E2CC-14B2-4640-8EEA-2C6BFB36FC38', 'A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Haircut and Styling',	120.00,	60),
    ('97D3FA85-54F2-4C1F-92BA-473E8E76B836', 'A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Bridal and Event Hair Styling',	150.00,	120),
    ('D3498395-9BF4-44AB-ACAE-6C682C39F9CB', '2C866524-527E-4174-ADB7-CC6A158EE7EC', 'Mens haircut',	30.00,	30),
    ('A99C1CB2-6F45-4857-900C-706A33717D26', 'A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Keratin Treatment',	260.00,	180),
    ('C5C9E73A-FF17-4D9A-AE92-76C549125CCD', 'A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Hair Coloring',	134.00,	120),
    ('3922AA13-4E11-41DE-B903-8B55E2874627', '2C866524-527E-4174-ADB7-CC6A158EE7EC', 'Balayage Highlights',	95.00,	30),
    ('C8B5E9E0-B1E4-4137-9AB3-8C8C6AAB47FE', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Vita Contour',	550.00,	180),
    ('47D79298-4C57-4190-971F-913D11FED19F', '22CB440A-DBAA-43CA-BD9E-39DAE3F63720', 'Hair cut',	33.00,	30),
    ('4C7AEC58-B79C-4160-BB15-9EBE65433A83', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Relaxing Massage',	140.00,	54),
    ('C2ECFD66-9B91-4D88-BC9C-B1A42544625E', 'A5B4C007-160B-4CFD-8CBD-4E094F77E185', 'Hair Consultation and Care Advice',	72.00,	125),
    ('D061AF6C-D4BE-4C0E-B25D-B6B47C07FBF5', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Bridal Styling',	140.00,	120),
    ('B991C8C9-58A3-404F-8DC0-CC817A645F8C', '22CB440A-DBAA-43CA-BD9E-39DAE3F63720', 'Deep Facial Cleansing',	25.00,	30),
    ('89BD845C-89B6-4689-A42E-CE077F766BA8', 'E15689FB-DBAC-4556-A172-899F013474C8', 'Gel Manicure',	20.00,	45),
    ('526AD58E-4872-41F0-BAD4-D25D77077DB4', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Signature Glow Facial',	70.00,	60),
    ('61234308-78F0-4E4E-8091-D99EE992D79A', '2C866524-527E-4174-ADB7-CC6A158EE7EC', 'Womens Haircut',	55.00,	45),
    ('CF27BAF9-F231-4F40-96F2-DBA093184FAC', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Nails',	20.00,	45),
    ('39655254-3815-404D-8EDD-EAA4A4793222', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Hair Coloring',	20.00,	45),
    ('9D03BA85-88A5-4F3C-847A-F718669BE46A', '4CE26E32-C9CE-4499-972B-FA8F32257728', 'Personal Styling & Consultation',	130.00,	85)
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
BOOKINGS_PER_DAY = 10


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
    """Genera 10 bookings por día para una fecha específica, permitiendo múltiples suppliers a la misma hora"""
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
    output_file = 'chronos-beauty-develop-bookings-2024-2025-COMPLETE.sql'
    
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

