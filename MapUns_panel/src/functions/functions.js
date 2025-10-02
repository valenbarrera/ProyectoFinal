module.exports = {
    DateTimeChanged(date)
    {
        var fecha = new Date(date);
        var fecha_str = "";
        
        var dia = fecha.getDate();
        if(dia<10) 
            fecha_str += "0" + dia;
        else 
            fecha_str += dia;
        fecha_str += "/";
        var month = fecha.getMonth();
        if(month<10) 
            fecha_str += "0" + month;
        else 
            fecha_str += month;
        fecha_str += "/";
        var Year = fecha.getFullYear();
        fecha_str += Year;
        fecha_str += " ";
        var Hour = fecha.getHours();
        if(Hour<10) 
            fecha_str += "0" + Hour;
        else 
            fecha_str += Hour;
        fecha_str += ":";
        var Minutes = fecha.getMinutes();
        if(Minutes<10) 
            fecha_str += "0" + Minutes;
        else 
            fecha_str += Minutes;
        
        return fecha_str;
    },
}