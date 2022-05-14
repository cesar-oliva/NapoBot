const Client = require('../models/clients')

router.get('/', async (req,res)=>{

    try{
        const arrayClientDB = await Client.find()
        console.log(arrayClientDB)

    }catch (error){
        console.log(error)
    }
})