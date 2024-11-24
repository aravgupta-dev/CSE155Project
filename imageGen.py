from huggingface_hub import InferenceClient
import matplotlib.pyplot as plt
import numpy as np
import os

# Create the images directory if it doesn't exist
#os.makedirs("images", exist_ok=True)

# Initialize the client
client = InferenceClient("black-forest-labs/FLUX.1-dev", token="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")

# Generate the image
image = client.text_to_image("Red shark in space")

# image_path = os.path.join("images", "image.png")
# image.save(image_path, format="PNG")

# # Displa   y the image
image_np = np.array(image)
plt.imshow(image_np)
plt.axis('off')  # Hide axes
plt.show()

