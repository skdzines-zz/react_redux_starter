import React, { useState, useRef, useEffect } from 'react';

const Tests = () => {

    const storyCount = 6;
    const storyObj = {
        name: 'Story Name',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In lacinia eros sit amet elit ornare, ac tempus mi finibus. Aliquam dignissim elit ut arcu posuere pulvinar varius vitae lectus. Praesent in massa orci. Duis hendrerit viverra massa quis congue. Maecenas fermentum iaculis nunc, ut lobortis nibh tristique eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla pharetra magna at est mattis, vitae finibus ligula vulputate. Fusce eu est sit amet ex fringilla porta. Praesent vitae augue pulvinar, laoreet turpis non, tempus velit.'
    }
    const data = [];

    for(let i = 0; i < storyCount; i++) {
        data.push(storyObj);
    }
    
    const [ stories, setStories ] = useState(data);
    const viewAreaRef = useRef();
    const lastStoryRef = useRef();

    useEffect(() => {
        let options = {
            root: null,
            rootMargin: "0px",
            threshold: .1
        };

        let observer = new IntersectionObserver(handleIntersect, options);
        observer.observe(lastStoryRef.current);
        
    }, [stories]);

    const handleIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMoreStories();
                observer = observer.disconnect()
            }
        })
    }
    
    const loadMoreStories = () => {
        const newStories = [];
    
        for(let i = 0; i < storyCount; i++) {
            newStories.push(storyObj);
        }
        setStories([...stories, ...newStories]);
    }

	return (
		<section id="view-area" ref={viewAreaRef}>
            {
                stories.map((story, index) => {
                    return <div className="story" key={`story-${index}`} ref={index === stories.length-1 ? lastStoryRef : null}>
                        <h2>{`${story.name} ${index+1}`}</h2>
                        <p>{story.content}</p>
                    </div>
                })
            }
        </section>
	);
}

export default Tests;