export const validation = (schema) => {

    return (req,res,next) => {
        const {error,value} = schema.validate(req.body,{abortEarly:false})
        if(error){
            throw new Error(error.details.map((d) => d.message).join(", "), {
                cause: 400,
            });
        }
        req.body = value;
        next();
    }
};
