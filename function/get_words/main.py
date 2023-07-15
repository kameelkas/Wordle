import boto3
import json

bucket = boto3.client('s3')

def get_words_handler(event, context):
    bucket_name = "kameel-wordle-words"
    words_file = "words.json"
    try:

        get_words = bucket.get_object(Bucket=bucket_name, Key=words_file)
        words = get_words['Body'].read().decode('utf-8')

        print(words)

        json_words = json.loads(words)

        return {
                'statusCode': 200,
                'body': json_words,
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
    except Exception as e:
        print('Error retrieving JSON file:', e)
        return {
            'statusCode': 500,
            'body': 'Error retrieving JSON file',
            'headers': {
                'Content-Type': 'application/json'
            }
        }