import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
    //  שימוש בקו התחתון גורם לערך הזה להיות האיידי של האובייקט בדאטה בייס (אם אין כזה הדאטה בייס מייצר איידי אוטומטי) 
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    }
})

export = mongoose.model('Student', studentSchema)

