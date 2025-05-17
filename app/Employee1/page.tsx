'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Your sample JSON data here (abbreviated for brevity, use the full data you shared)
const employeeData = [
    {
        "EMP NO": "DW00341",
        "NAME": "MOHAMMAD SHAKIR ALI",
        "SITE DESIGNATION": "DRIVER HMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "8-Jul-19",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00420",
        "NAME": "MOHAMMAD ABDUL SALAM",
        "SITE DESIGNATION": "DRIVER HMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "7-May-12",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01260",
        "NAME": "SAIFUL ABDUL HAKIM",
        "SITE DESIGNATION": "INDIRECT-HSE-FIREWATCH",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "16-Sep-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00822",
        "NAME": "IBRAHIM ANSER",
        "SITE DESIGNATION": "DRIVER LMV",
        "DESIGNATION": "DRIVER LMV",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "17-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01177",
        "NAME": "BHARAT THAPA CHHETRI",
        "SITE DESIGNATION": "DRIVER LMV",
        "DESIGNATION": "DRIVER LMV",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "23-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00287",
        "NAME": "EMELIANO ANDUS ANDABON",
        "SITE DESIGNATION": "DOCUMENT CONTROLLER",
        "DESIGNATION": "DOCUMENT CONTROLLER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "DC",
        "HOD": "FARUK",
        "DOJ": "22-Nov-11",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00505",
        "NAME": "KISHORE GANGADHARA GANGADHARA",
        "SITE DESIGNATION": "MECHANICAL ENGINEER",
        "DESIGNATION": "ASSISTANT ENGINEER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SENTHIL",
        "DOJ": "3-Jul-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00508",
        "NAME": "RAJ AHMED MEHABOOB",
        "SITE DESIGNATION": "PROJECT DIRECTOR",
        "DESIGNATION": "PROJECT DIRECTOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "MANAGEMENT",
        "HOD": "",
        "DOJ": "11-Jul-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00533",
        "NAME": "MOHAMMED FARUK HUSSAIN",
        "SITE DESIGNATION": "QC MANAGER",
        "DESIGNATION": "QC MANAGER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "QAQC",
        "HOD": "RAJ AHMED",
        "DOJ": "24-Dec-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00578",
        "NAME": "MUHAMMAD SOHAIL MUHAMMAD AFZAL GILL",
        "SITE DESIGNATION": "QA PROCUREMENT",
        "DESIGNATION": "MECHANICAL SUPERVISOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "QAQC",
        "HOD": "FARUK",
        "DOJ": "29-Jul-17",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00594",
        "NAME": "MOHAMMAD ABDUL MATEEN",
        "SITE DESIGNATION": "QC INSPECTOR CIVIL",
        "DESIGNATION": "QC INSPECTOR-CIVIL",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "QAQC",
        "HOD": "FARUK",
        "DOJ": "7-Oct-17",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00616",
        "NAME": "BINAYAK DANDAPANI  NAYAK",
        "SITE DESIGNATION": "ELECTRICAL SUPERVISOR",
        "DESIGNATION": "ELECTRICAL SUPERVISOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "RAJ AHMED",
        "DOJ": "14-Mar-14",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00644",
        "NAME": "WALID AID MUHAMMED AL OTAIBI",
        "SITE DESIGNATION": "STORE ASSISTANT ",
        "DESIGNATION": "STORE ASSISTANT ",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "MATERIALS & INV",
        "HOD": "NIKESH ",
        "DOJ": "1-Jan-20",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00781",
        "NAME": "SIKANDAR PRASAD HARI PRASAD",
        "SITE DESIGNATION": "PERMIT RECEIVER",
        "DESIGNATION": "PERMIT RECEIVER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "PERMITS",
        "HOD": "SANDEEP",
        "DOJ": "17-Feb-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00843",
        "NAME": "DAMMAR BAHADUR BASNET",
        "SITE DESIGNATION": "TIME KEEPER",
        "DESIGNATION": "TIME KEEPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "25-Oct-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW00887",
        "NAME": "BIJAY KUMAR YADAV",
        "SITE DESIGNATION": "STORE ASSISTANT",
        "DESIGNATION": "HELPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "MATERIALS & INV",
        "HOD": "NIKESH ",
        "DOJ": "20-Nov-18",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00780",
        "NAME": "SARFARAJ MOHAMMAD SADIK",
        "SITE DESIGNATION": "PLANNING ASSISTANT",
        "DESIGNATION": "DOCUMENT CONTROLLER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "PROJECT CONTROLS",
        "HOD": "RAJ AHMED",
        "DOJ": "31-Dec-13",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW00927",
        "NAME": "PANKAJ KUMAR SINGH",
        "SITE DESIGNATION": "CHARGE HAND PIPING",
        "DESIGNATION": "CHARGE HAND PIPING",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "14-Jan-14",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00955",
        "NAME": "RAJA PANDEY RADHESHYAM",
        "SITE DESIGNATION": "WELDER STRUCTURAL",
        "DESIGNATION": "WELDER STRUCTURAL",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "12-Feb-14",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00956",
        "NAME": "ASHOK PANDEY LALJEE PANDEY",
        "SITE DESIGNATION": "PIPE FITTER",
        "DESIGNATION": "PIPE FITTER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "12-Feb-14",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00958",
        "NAME": "MOHAMMAD NAZIM AHMAD",
        "SITE DESIGNATION": "ELECTRICIAN",
        "DESIGNATION": "ELECTRICIAN",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "27-Aug-19",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00980",
        "NAME": "BIJU PUTHEN PARAMBIL JOHN",
        "SITE DESIGNATION": "DRIVER HMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "9-Sep-17",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00997",
        "NAME": "JAINUDIN MANSURI",
        "SITE DESIGNATION": "WELDER-TIG & ARC",
        "DESIGNATION": "WELDER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "10-Jan-18",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01005",
        "NAME": "MOHAMED MOIZUDDIN",
        "SITE DESIGNATION": "ELECTRICIAN",
        "DESIGNATION": "ELECTRICIAN",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "6-Feb-18",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01010",
        "NAME": "ABRAN AHMAD ANSARI",
        "SITE DESIGNATION": "RIGGER LEVEL 1 TUV",
        "DESIGNATION": "RIGGER LEVEL 3 ARAMCO",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "16-Feb-18",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW01045",
        "NAME": "MOIDU KUNCHI IBRAHIM",
        "SITE DESIGNATION": "DRIVER LMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "20-Jul-19",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01068",
        "NAME": "THUSITHA P. G. WIDANALAGE SILVA",
        "SITE DESIGNATION": "BOBCAT OPERATOR TUV",
        "DESIGNATION": "HEAVY EQUIPMENT OPERATOR",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SUKHA RAM",
        "DOJ": "20-Feb-20",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01076",
        "NAME": "RAM PUNIT SAH SAGAR",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "22-Feb-20",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01099",
        "NAME": "ELTAF AHAMAD MIYA HUSSAIN",
        "SITE DESIGNATION": "INDIRECT-HSE-FIREWATCH",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "5-Mar-20",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DH01069",
        "NAME": "ZIYADUR RAHAMAN",
        "SITE DESIGNATION": "DRIVER LMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "9-Dec-16",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01111",
        "NAME": "MATIULLAH KHAN RASHEED AHMAD KHAN",
        "SITE DESIGNATION": "DRIVER HMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "4-Sep-21",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01122",
        "NAME": "MOHAN KEWAT",
        "SITE DESIGNATION": "INDIRECT-ADMIN-LAYDOWN",
        "DESIGNATION": "HELPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "8-Sep-21",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00726",
        "NAME": "FAISAL SALEH M ALHARBI",
        "SITE DESIGNATION": "GRO / SITE COORDINATOR",
        "DESIGNATION": "GRO / SITE COORDINATOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "GRO",
        "HOD": "ADMIN",
        "DOJ": "1-Jan-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01214",
        "NAME": "BILLAL GAZI HOSSEN GAZI",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "28-Apr-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01216",
        "NAME": "MD MASUM BILLAH",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "28-Apr-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00765",
        "NAME": "ADNAN ZAHEER SYED",
        "SITE DESIGNATION": "SAFETY OFFICER",
        "DESIGNATION": "SAFETY OFFICER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "HSE",
        "HOD": "SANDEEP",
        "DOJ": "19-Jun-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01191",
        "NAME": "HABEL MIA",
        "SITE DESIGNATION": "MASON",
        "DESIGNATION": "MASON",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "22-Sep-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01271",
        "NAME": "MUHAMMAD NADEEM MUHAMMAD ASHRAF",
        "SITE DESIGNATION": "DRIVER LMV",
        "DESIGNATION": "DRIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "1-Oct-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00438",
        "NAME": "SURINDER KUMAR",
        "SITE DESIGNATION": "CONSTRUCTION MANAGER",
        "DESIGNATION": "CIVIL MANAGER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "RAJ AHMED",
        "DOJ": "23-Aug-12",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW00932",
        "NAME": "ABHAY RAY",
        "SITE DESIGNATION": "WELDER STRUCTURAL",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "11-Jan-14",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01288",
        "NAME": "MD RASEL ABDUL MANNAN",
        "SITE DESIGNATION": "OFFICE BOY",
        "DESIGNATION": "HELPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "7-Nov-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01157",
        "NAME": "MD IMRAN HOSSAIN ",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "25-Apr-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00816",
        "NAME": "ALA SULIMAN AL SHAREEF",
        "SITE DESIGNATION": "GOVERNMENT RELATIONS OFFICER",
        "DESIGNATION": "GOVERNMENT RELATIONS OFFICER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "GRO",
        "HOD": "ADMIN",
        "DOJ": "12-May-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00818",
        "NAME": "FAHAD INAD S ALJOHANI",
        "SITE DESIGNATION": "IT ASSISTANT",
        "DESIGNATION": "IT ASSISTANT",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ACCOUNTS / IT",
        "HOD": "KRISHNA",
        "DOJ": "20-May-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01152",
        "NAME": "MANOJ KUMAR RAY YADAV",
        "SITE DESIGNATION": "GRINDER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "27-Jun-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00805",
        "NAME": "SHYAM KUMAR CHAUDHARY",
        "SITE DESIGNATION": "GENERAL SERVICE OFFICER",
        "DESIGNATION": "GENERAL SERVICE OFFICER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "21-Mar-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW00806",
        "NAME": "GAJENDRA SAH KISHUN SAH",
        "SITE DESIGNATION": "CHARGE HAND HYDRO TEST ",
        "DESIGNATION": "CHARGE HAND HYDRO TEST ",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "28-Jun-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00595",
        "NAME": "NAUFAL KILIYAMANNIL HUSSAIN",
        "SITE DESIGNATION": "QC INSPECTOR PIPING",
        "DESIGNATION": "QC INSPECTOR PIPING",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "QAQC",
        "HOD": "FARUK",
        "DOJ": "2-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW00941",
        "NAME": "VISHAL BHARTI ",
        "SITE DESIGNATION": "CHARGE HAND ELECTRICAL",
        "DESIGNATION": "CHARGE HAND ELECTRICAL",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "8-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01261",
        "NAME": "SAHABUDDIN FAKIR",
        "SITE DESIGNATION": "SCAFFOLDING SUPERVISOR",
        "DESIGNATION": "SCAFFOLDER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON SCAFFOLDING",
        "HOD": "KISHORE",
        "DOJ": "12-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00965",
        "NAME": "SERAJ ALAM HASHULLAH",
        "SITE DESIGNATION": "PIPE FABRICATOR",
        "DESIGNATION": "PIPE FABRICATOR",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "12-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW00905",
        "NAME": "JAY PRAKASH SINGH",
        "SITE DESIGNATION": "GRINDER",
        "DESIGNATION": "GRINDER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "12-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01100",
        "NAME": "RAM PRAGAS YADAV",
        "SITE DESIGNATION": "INDIRECT-ADMIN-SECURITY-NIGHT",
        "DESIGNATION": "HELPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "12-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00798",
        "NAME": "MOHAMMED ALI AHMED HASAN",
        "SITE DESIGNATION": "PLANNING ENGINEER",
        "DESIGNATION": "PLANNING ENGINEER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "PROJECT CONTROLS",
        "HOD": "RAJ AHMED",
        "DOJ": "29-Apr-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01201",
        "NAME": "TOFAZZAL ABUL MOLLAH",
        "SITE DESIGNATION": "CARPENTER",
        "DESIGNATION": "CARPENTER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "2-Aug-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01200",
        "NAME": "MONJORUL OHED ALI",
        "SITE DESIGNATION": "CARPENTER",
        "DESIGNATION": "CARPENTER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "2-Aug-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01246",
        "NAME": "MD RAMJAN ALI",
        "SITE DESIGNATION": "RIGGER LEVEL 3 TUV",
        "DESIGNATION": "RIGGER-III",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "ANSARI",
        "DOJ": "2-Aug-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01324",
        "NAME": "BAJIR MOMIN ",
        "SITE DESIGNATION": "SCAFFOLDER",
        "DESIGNATION": "SCAFFOLDER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON SCAFFOLDING",
        "HOD": "SAHABUDDIN",
        "DOJ": "2-Aug-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00834 ",
        "NAME": "TARIQ AHMED A ALZAHRANI",
        "SITE DESIGNATION": "GRO  ",
        "DESIGNATION": "GRO  ",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "ADMIN",
        "DOJ": "22-Aug-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW01135",
        "NAME": "ARBIN YADAV",
        "SITE DESIGNATION": "SCAFFOLDER",
        "DESIGNATION": "SCAFFOLDER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON SCAFFOLDING",
        "HOD": "SAHABUDDIN",
        "DOJ": "4-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DH01520",
        "NAME": "SENTHIL KUMAR RAMALINGAM",
        "SITE DESIGNATION": "CONSTRUCTION MANAGER",
        "DESIGNATION": "CONSTRUCTION MANAGER PIPING",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "RAJ AHMED",
        "DOJ": "15-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DH01536",
        "NAME": "ZAFAR MUMTAZ",
        "SITE DESIGNATION": "PERMIT RECEIVER",
        "DESIGNATION": "PERMIT RECEIVER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "SANDEEP",
        "DOJ": "20-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW01140",
        "NAME": "RAM ISHWAR PANDIT",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SUKHA RAM",
        "DOJ": "24-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01185",
        "NAME": "SURAJ SADA",
        "SITE DESIGNATION": "CARPENTER",
        "DESIGNATION": "CARPENTER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SUKHA RAM",
        "DOJ": "24-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01190",
        "NAME": "MOHAMUD MOBEEN MOHAMUD JAFFAR",
        "SITE DESIGNATION": "SR.FOREMAN HEAVY EQUIPMENT ",
        "DESIGNATION": "SR.FOREMAN HEAVY EQUIPMENT ",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SENTHIL",
        "DOJ": "27-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DH01530",
        "NAME": "MAHTAB AHMAD",
        "SITE DESIGNATION": "PERMIT RECEIVER",
        "DESIGNATION": "PERMIT RECEIVER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "PERMITS",
        "HOD": "SANDEEP",
        "DOJ": "29-Sep-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW01294",
        "NAME": "BIJAY KUMAR DAS",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER ",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "KISHORE",
        "DOJ": "5-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01195",
        "NAME": "JASIM UDDIN",
        "SITE DESIGNATION": "STEEL FIXER",
        "DESIGNATION": "STEEL FIXER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON MECH",
        "HOD": "SUKHA RAM",
        "DOJ": "9-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01253",
        "NAME": "MD TANVIR HOSSAIN",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "23-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01215",
        "NAME": "MOHAMMAD JISHAN MIA",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "9-Nov-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01267",
        "NAME": "SABOWODEN ABDUL MOTALAB ",
        "SITE DESIGNATION": "TUBE FITTER ",
        "DESIGNATION": "TUBE FITTER ",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON ELEC",
        "HOD": "BINAYAK",
        "DOJ": "9-Nov-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DW01268",
        "NAME": "MOHAMMED JAHANGIR ALAM",
        "SITE DESIGNATION": "SCAFFOLDER",
        "DESIGNATION": "SCAFFOLDER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON SCAFFOLDING",
        "HOD": "SAHABUDDIN",
        "DOJ": "19-Nov-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00789",
        "NAME": "NIKESH KUMAR SIYARAM SINGH",
        "SITE DESIGNATION": "ASST. STORE KEEPER",
        "DESIGNATION": "ASST. STORE KEEPER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "MATERIALS & INV",
        "HOD": "RAJ AHMED",
        "DOJ": "",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DW01198",
        "NAME": "MOHAMMAD HAMID ULLAH",
        "SITE DESIGNATION": "STEEL FIXER",
        "DESIGNATION": "STEEL FIXER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SUKHA RAM",
        "DOJ": "22-Sep-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00750",
        "NAME": "MOHAMMAD KALEEM SIDDIQUI",
        "SITE DESIGNATION": "SAFETY OFFICER",
        "DESIGNATION": "SAFETY OFFICER",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "HSE",
        "HOD": "SANDEEP",
        "DOJ": "25-Mar-22",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DS00593",
        "NAME": "SANDEEP VEERAPPA POOJARY",
        "SITE DESIGNATION": "SAFETY MANAGER",
        "DESIGNATION": "SAFETY SUPERVISOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "HSE",
        "HOD": "RAJ AHMED",
        "DOJ": "2-Oct-17",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "OWN"
    },
    {
        "EMP NO": "DW00990",
        "NAME": "MOHAMMAD ALAUDDIN",
        "SITE DESIGNATION": "CONSTRUCTION HELPER",
        "DESIGNATION": "HELPER",
        "HEAD": "DIRECT",
        "DEPARTMENT": "ADMINISTRATION",
        "HOD": "SUKHA RAM",
        "DOJ": "12-Jul-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "",
        "NAME": "RENGARAJAN SEKAR\nSUBBASAMY RAJA",
        "SITE DESIGNATION": "QCI WELDING",
        "DESIGNATION": "QCI WELDING",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "QAQC",
        "HOD": "FARUK",
        "DOJ": "14-May-25",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    },
    {
        "EMP NO": "DS00688",
        "NAME": "IJAZ AKHTER AKHTER HUSSAIN",
        "SITE DESIGNATION": "LAND SURVEYOR",
        "DESIGNATION": "LAND SURVEYOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON CIVIL",
        "HOD": "SURINDER",
        "DOJ": "7-Oct-24",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE CAMP"
    },
    {
        "EMP NO": "DS00724",
        "NAME": "MADHURESH RAI",
        "SITE DESIGNATION": "SCAFFOLDING SUPERVISOR",
        "DESIGNATION": "SCAFFOLDING SUPERVISOR",
        "HEAD": "INDIRECT",
        "DEPARTMENT": "CON SCAFFOLDING",
        "HOD": "MADHURESH",
        "DOJ": "",
        "RELEASE DATE": "",
        "ACCOMMODATION STATUS": "LIFE HOTEL"
    }
] 

const COLORS = [
  '#8884d8', '#8dd1e1', '#82ca9d', '#ffc658', '#ff8042',
  '#00c49f', '#d0ed57', '#a4de6c', '#0088FE', '#00C49F',
  '#FFBB28', '#FF8042', '#AF19FF'
];

const unique = (arr: string[]) => [...new Set(arr)];

function useDashboardStats(data: typeof employeeData) {
  return useMemo(() => {
    const total = data.length;
    const direct = data.filter(emp => emp.HEAD === 'DIRECT').length;
    const indirect = data.filter(emp => emp.HEAD === 'INDIRECT').length;

    const accommodationCounts = unique(data.map(emp => emp['ACCOMMODATION STATUS']))
      .map(type => ({
        type,
        count: data.filter(emp => emp['ACCOMMODATION STATUS'] === type).length,
      }));

    const departmentCounts = unique(data.map(emp => emp.DEPARTMENT))
      .map(department => ({
        department,
        count: data.filter(emp => emp.DEPARTMENT === department).length,
      }));

    return { total, direct, indirect, accommodationCounts, departmentCounts };
  }, [data]);
}

type DialogView =
  | null
  | 'total'
  | 'direct'
  | 'indirect'
  | 'accommodation'
  | 'accommodation_chart'
  | 'department_chart'
  | 'head_chart';

const thBase = 'border-b border-gray-200 px-4 py-1 whitespace-nowrap text-gray-700 bg-gray-100 sticky top-0 z-10 text-xs font-semibold';
const tdBase = 'border px-4 py-1 text-sm truncate';

function TableEmployees({ filteredData }: { filteredData: typeof employeeData }) {
  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-250px)] w-full">
      <table className="min-w-[1100px] w-full text-sm">
        <thead>
          <tr>
            <th className={`${thBase} w-16 text-left`}>S.No</th>
            <th className={`${thBase} w-40 text-left`}>EMP NO</th>
            <th className={`${thBase} w-64 text-left`}>NAME</th>
            <th className={`${thBase} w-44 text-left`}>DEPARTMENT</th>
            <th className={`${thBase} w-44 text-left`}>DESIGNATION</th>
            <th className={`${thBase} w-24 text-left`}>HEAD</th>
            <th className={`${thBase} w-44 text-left`}>ACCOMMODATION</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((emp, index) => (
            <tr key={emp['EMP NO'] + index} className="even:bg-white/20 hover:bg-blue-50 transition">
              <td className={`${tdBase} w-16 text-left`}>{index + 1}</td>
              <td className={`${tdBase} w-40 text-left`}>{emp['EMP NO']}</td>
              <td className={`${tdBase} w-64 text-left`}>{emp.NAME}</td>
              <td className={`${tdBase} w-44 text-left`}>{emp.DEPARTMENT}</td>
              <td className={`${tdBase} w-44 text-left`}>{emp.DESIGNATION}</td>
              <td className={`${tdBase} w-24 text-left`}>{emp.HEAD}</td>
              <td className={`${tdBase} w-44 text-left`}>{emp['ACCOMMODATION STATUS']}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-200 font-semibold z-10">
          <tr>
            <td className={`${tdBase} text-left`} colSpan={2}>Grand Total</td>
            <td className={`${tdBase} text-left`} colSpan={5}>{filteredData.length}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TableAccommodation({ accommodationCounts }: { accommodationCounts: { type: string, count: number }[] }) {
  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-250px)] w-full">
      <table className="min-w-[300px] w-full text-sm">
        <thead>
          <tr>
            <th className={`${thBase} w-52 text-left`}>Type</th>
            <th className={`${thBase} w-32 text-right`}>Count</th>
          </tr>
        </thead>
        <tbody>
          {accommodationCounts.map((ac, idx) => (
            <tr key={ac.type + idx} className="even:bg-white/20 hover:bg-blue-50 transition">
              <td className={`${tdBase} w-52 text-left`}>{ac.type}</td>
              <td className={`${tdBase} w-32 text-right`}>{ac.count}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-200 font-semibold z-10">
          <tr>
            <td className={`${tdBase} text-left`}>Grand Total</td>
            <td className={`${tdBase} text-right`}>{accommodationCounts.reduce((sum, a) => sum + a.count, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TableDepartment({ departmentCounts }: { departmentCounts: { department: string, count: number }[] }) {
  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-250px)] w-full">
      <table className="min-w-[500px] w-full text-sm">
        <thead>
          <tr>
            <th className={`${thBase} w-72 text-left`}>Department</th>
            <th className={`${thBase} w-32 text-right`}>Count</th>
          </tr>
        </thead>
        <tbody>
          {departmentCounts.map((dep, idx) => (
            <tr key={dep.department + idx} className="even:bg-white/20 hover:bg-blue-50 transition">
              <td className={`${tdBase} w-72 text-left`}>{dep.department}</td>
              <td className={`${tdBase} w-32 text-right`}>{dep.count}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-200 font-semibold z-10">
          <tr>
            <td className={`${tdBase} text-left`}>Grand Total</td>
            <td className={`${tdBase} text-right`}>{departmentCounts.reduce((sum, d) => sum + d.count, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function TableHeadSummary({ direct, indirect }: { direct: number, indirect: number }) {
  return (
    <div className="flex-grow overflow-auto rounded-md border border-gray-300 max-h-[calc(100vh-250px)] w-full">
      <table className="min-w-[350px] w-full text-sm">
        <thead>
          <tr>
            <th className={`${thBase} w-52 text-left`}>Head</th>
            <th className={`${thBase} w-32 text-right`}>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-blue-50 transition">
            <td className={`${tdBase} w-52 text-left`}>Direct</td>
            <td className={`${tdBase} w-32 text-right`}>{direct}</td>
          </tr>
          <tr className="hover:bg-blue-50 transition">
            <td className={`${tdBase} w-52 text-left`}>Indirect</td>
            <td className={`${tdBase} w-32 text-right`}>{indirect}</td>
          </tr>
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-200 font-semibold z-10">
          <tr>
            <td className={`${tdBase} text-left`}>Grand Total</td>
            <td className={`${tdBase} text-right`}>{direct + indirect}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
export default function Dashboard() {
  const stats = useDashboardStats(employeeData);
  const [expanded, setExpanded] = useState<DialogView>(null);
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!expanded) return [];
    const base = expanded === 'direct'
      ? employeeData.filter(e => e.HEAD === 'DIRECT')
      : expanded === 'indirect'
        ? employeeData.filter(e => e.HEAD === 'INDIRECT')
        : employeeData;
    return base.filter(emp =>
      emp.NAME?.toLowerCase().includes(search.toLowerCase()) ||
      emp['EMP NO']?.toLowerCase().includes(search.toLowerCase()) ||
      emp.DEPARTMENT?.toLowerCase().includes(search.toLowerCase())
    );
  }, [expanded, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: 'total', title: 'Total Employees', value: stats.total },
          { key: 'direct', title: 'Direct', value: stats.direct },
          { key: 'indirect', title: 'Indirect', value: stats.indirect },
        ].map(item => (
          <Card
            key={item.key}
            className="cursor-pointer hover:shadow-2xl transition"
            onClick={() => setExpanded(item.key as DialogView)}
          >
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{item.value}</span>
            </CardContent>
          </Card>
        ))}
        <Card
          className="cursor-pointer hover:shadow-2xl transition"
          onClick={() => setExpanded('accommodation')}
        >
          <CardHeader><CardTitle className="text-sm">Accommodation</CardTitle></CardHeader>
          <CardContent>
            {stats.accommodationCounts.map(ac => (
              <div key={ac.type} className="flex justify-between text-sm">
                <span>{ac.type}</span><span className="font-bold">{ac.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          className="cursor-pointer hover:shadow-2xl transition"
          onClick={() => setExpanded('accommodation_chart')}
        >
          <CardHeader>
            <CardTitle className="text-sm">Accommodation Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.accommodationCounts} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label>
                  {stats.accommodationCounts.map((entry, idx) => (
                    <Cell key={entry.type} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-2xl transition"
          onClick={() => setExpanded('department_chart')}
        >
          <CardHeader><CardTitle className="text-sm">Departments</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.departmentCounts}>
                <XAxis dataKey="department" angle={-25} height={80} interval={0} />
                <YAxis />
                <Bar dataKey="count">
                  {stats.departmentCounts.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-2xl transition"
          onClick={() => setExpanded('head_chart')}
        >
          <CardHeader><CardTitle className="text-sm">Direct vs Indirect</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[
                  { name: 'Direct', value: stats.direct },
                  { name: 'Indirect', value: stats.indirect }
                ]} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                  <Cell fill="#22c55e" /><Cell fill="#3b82f6" />
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={!!expanded} onOpenChange={() => setExpanded(null)}>
        <DialogContent
          className="max-w-5xl w-full max-h-[85vh] overflow-auto bg-white"
        >
          <DialogHeader className="flex flex-row justify-between items-center p-6 border-b">
            <DialogTitle className="text-xl font-bold">
              {expanded && expanded.replace('_', ' ').toUpperCase()}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex-1 w-full flex flex-col items-center justify-center p-6">
            {/* Main Employee Tables */}
            {['total', 'direct', 'indirect'].includes(expanded!) && (
              <>
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4 w-1/3"
                />
                <TableEmployees filteredData={filteredData} />
              </>
            )}
            {/* Accomodation Summary (Chart + Table) */}
            {(expanded === 'accommodation' || expanded === 'accommodation_chart') && (
              <div className="w-full grid md:grid-cols-2 gap-8 mt-8 items-start">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={stats.accommodationCounts} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={160} label>
                      {stats.accommodationCounts.map((entry, idx) => (
                        <Cell key={entry.type} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <TableAccommodation accommodationCounts={stats.accommodationCounts} />
              </div>
            )}
            {/* Department Chart + Table */}
            {expanded === 'department_chart' && (
              <div className="w-full grid md:grid-cols-2 gap-8 mt-8 items-start">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.departmentCounts}>
                    <XAxis dataKey="department" angle={-25} interval={0} height={100} />
                    <YAxis />
                    <Bar dataKey="count">
                      {stats.departmentCounts.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
                <TableDepartment departmentCounts={stats.departmentCounts} />
              </div>
            )}
            {/* Head Chart (Direct/Indirect) + Table */}
            {expanded === 'head_chart' && (
              <div className="w-full grid md:grid-cols-2 gap-8 mt-8 items-start">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Direct', value: stats.direct },
                      { name: 'Indirect', value: stats.indirect }
                    ]} dataKey="value" cx="50%" cy="50%" outerRadius={160} label>
                      <Cell fill="#22c55e" /><Cell fill="#3b82f6" />
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <TableHeadSummary direct={stats.direct} indirect={stats.indirect} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}