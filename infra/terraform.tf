terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

#specifying provider region
provider "aws" {
  region = "ca-central-1"
}

#Creating an IAM role for the function
resource "aws_iam_role" "IAM-role" {
  name               = "IAM-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# IAM policy for all 6 lambda functions
resource "aws_iam_policy" "policy" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "lambda:*",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "s3:*"
      ],
      "Resource": ["*"],
      "Effect": "Allow"
    }
  ]
}
EOF
}

//policy attachment 
resource "aws_iam_role_policy_attachment" "polAttach" {
  role       = aws_iam_role.IAM-role.name
  policy_arn = aws_iam_policy.policy.arn
}

//archive file from main.py for lambda function
data "archive_file" "archive_get_words" {
  type        = "zip"
  source_file = "../function/get_words/main.py"
  output_path = "../function/get_words/artifact.zip"
}


//creating lambda function
resource "aws_lambda_function" "lambda_function_get_words" {
  role             = aws_iam_role.IAM-role.arn
  function_name    = "get_words"
  handler          = "main.get_words_handler"
  filename         = "../function/get_words/artifact.zip"
  source_code_hash = data.archive_file.archive_get_words.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function_url" "get_words_url" {
  function_name      = aws_lambda_function.lambda_function_get_words.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "url_get_words" {
  value = aws_lambda_function_url.get_words_url.function_url
}