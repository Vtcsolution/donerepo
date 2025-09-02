
import { useMemo, useRef, useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import JoditEditor from 'jodit-react';

const Update_Terms_Confitions = () => {
    const [side, setSide] = useState(false); // Sidebar state

    // const formatDate = (date) => {
    //   if (!date) return "Not provided"
    //   return new Date(date).toLocaleDateString("en-US", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //   })
    // }
    const editor = useRef(null);
   const [content, setContent] = useState('');

	const config = useMemo(() => ({
			readonly: false, // all options from https://xdsoft.net/jodit/docs/,
			placeholder: ""
		}),
		[]
	);


    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    }

  return (
   <div>
    <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
    </div>
     <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
      <div className="dashboard-side min-h-screen ">       
         <div>
             <h2 className=' text-2xl md:text-3xl lg:text-4xl font-sans text-[#3B5EB7] font-extrabold text-center my-6'>Update Terms and Conditions</h2>
             <div className=' mx-4'>
                <JoditEditor
			ref={editor}
			value={content}
			config={config}
			tabIndex={1} // tabIndex of textarea
			onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
			onChange={newContent => {setContent(newContent)}}
		/>
             </div>
         </div>
        </div>
    </div>
   </div>
   
  )
}

export default Update_Terms_Confitions