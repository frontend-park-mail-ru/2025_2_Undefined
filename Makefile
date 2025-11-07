deploy:
	echo -e  '\033[44mBuilding...\033[0m'
	docker build -t lzimin05/ui .
	echo -e  '\033[44mSending to Docker Hub...\033[0m'
	docker push 'lzimin05/ui'
	echo -e '\033[44mSuccessful!\033[0m'
