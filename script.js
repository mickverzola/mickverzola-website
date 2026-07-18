document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Fetch text content from JSON
    try {
        const response = await fetch('content.json');
        
        if (!response.ok) {
            throw new Error('Could not load content.json');
        }
        
        const data = await response.json();
        
        // Inject data into HTML elements
        document.getElementById('headline').textContent = data.headline;
        document.getElementById('bio-title').textContent = data.bioTitle;
        document.getElementById('bio-subtitle').textContent = data.bioSubtitle;
        document.getElementById('bio-text').textContent = data.bioText;
        document.getElementById('caption-1').textContent = data.caption1;
        document.getElementById('caption-2').textContent = data.caption2;
        document.getElementById('footer-text').textContent = data.footerText;
        document.getElementById('link-instagram').href = data.instagramLink;
        document.getElementById('link-facebook').href = data.facebookLink;

    } catch (error) {
        console.error("Error loading text content:", error);
    }

    // 2. Dynamic Image Randomizer
    // Set maxImages to the total number of photos you uploaded to the 'images' folder
    const maxImages = 2; 
    
    // Pick two unique random numbers between 1 and maxImages
    let randomInt1 = Math.floor(Math.random() * maxImages) + 1;
    let randomInt2 = Math.floor(Math.random() * maxImages) + 1;
    
    // Ensure the two images are never the same
    while(randomInt2 === randomInt1 && maxImages > 1) {
        randomInt2 = Math.floor(Math.random() * maxImages) + 1;
    }

    // Assign the image sources
    const img1 = document.getElementById('dynamic-image-1');
    const img2 = document.getElementById('dynamic-image-2');
    
    // This assumes your files are named 1.jpg, 2.jpg, etc., inside an 'images' folder
    img1.src = `images/${randomInt1}.jpg`;
    img2.src = `images/${randomInt2}.jpg`;
    
    // Error fallback in case the image doesn't exist yet
    img1.onerror = () => { img1.src = 'https://via.placeholder.com/800x600/f5f3ec/dcd6c8?text=Image+1'; };
    img2.onerror = () => { img2.src = 'https://via.placeholder.com/800x600/f5f3ec/dcd6c8?text=Image+2'; };
});
