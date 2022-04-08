// Define a "Contact" model

module.exports = function(sequelize, DataTypes) {
return sequelize.define('contact_messages', {
    message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    email_id: DataTypes.STRING,      
    message_text: DataTypes.STRING,
    message_timestamp: DataTypes.DATE, 
    // user_id: {
    //     type: DataTypes.INTEGER,
    //     foreignKey: true
    // },
    name: DataTypes.STRING,
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});
}
