import mongoose,{Schema} from 'mongoose';

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String },
    email: { type: String, required: true },
    permissions: { type: Schema.Types.Mixed }
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;