
import torch
import torchvision
from torchvision import models
from PIL import Image


img = Image.open("data/golden_retriever.jpg")

# Opening a window to display the image.
#img.show()

# Need to adjust all images to the format resnet was trained on.
preprocess = torchvision.transforms.Compose([
    torchvision.transforms.Resize(256),
    torchvision.transforms.CenterCrop(224),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]), # Means and STD of ImageNet
])

img_t = preprocess(img)

# pytorch expects a batch of images, so we need to add a dimension.
batch_t = torch.unsqueeze(img_t, 0)

resnet = models.resnet101(weights=models.ResNet101_Weights.IMAGENET1K_V1)

# Stop the model from updating its weights.
resnet.eval()

# Turn off the gradient engine to save memory
with torch.no_grad():
    output = resnet(batch_t)


with open('data/imagenet_classes.txt') as f:
    labels = [line.strip() for line in f.readlines()]

_, index = torch.max(output, 1)
percentage = torch.nn.functional.softmax(output, dim=1)[0] * 100
final_answer_with_percentage_confidence = labels[index.item()], percentage[index.item()].item()
print(final_answer_with_percentage_confidence)