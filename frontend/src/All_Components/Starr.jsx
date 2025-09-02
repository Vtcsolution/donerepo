import { Star, StarHalfIcon, StarIcon } from "lucide-react";


const Starr = ({stars}) => {
    const ratingstars = Array.from({length:5},(_,index)=>{
        let number = index + 0.5;
        return(
            <span key={index}>
                {
                    stars >= index+1 ? <StarIcon sx={{color:"#facc15"}}/> : stars >=number ? <StarHalfIcon sx={{color:"#facc15"}}/> : <Star sx={{color:"#facc15"}}/>
                }
            </span>
        )
    })
  return ratingstars
}

export default Starr