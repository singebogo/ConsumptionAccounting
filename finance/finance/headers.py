from django.utils.deprecation import MiddlewareMixin


class HttpResponseCustomHeader(MiddlewareMixin):
    def process_response(self, request, response):
        # 只在没有 Version 头时添加
        if not response.has_header("Version"):
            # response['Access-Control-Expose-Headers'] = "*"
            response['Access-Control-Allow-Origin'] = '*'
            response["Version"] = "2"
            response["Version_old"] = "1"

            # 确保 Vary 头包含 Origin
            vary_headers = response.get('Vary', '').split(', ')
            if 'Origin' not in vary_headers:
                vary_headers.append('Origin')
                response['Vary'] = ', '.join(filter(None, vary_headers))
            response['Access-Control-Allow-Origin'] = '*'
        return response